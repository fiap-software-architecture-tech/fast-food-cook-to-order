# ===========================
# DATA SOURCES - AWS RESOURCES
# ===========================

# Data source para usar a LabRole existente
data "aws_iam_role" "lab_role" {
  name = "LabRole"
}

# Data source para DynamoDB Cook-to-Order (apenas para este serviço)
data "aws_dynamodb_table" "cook_to_order" {
  name = "fastfood-orders-cook-to-order"
}

# ===========================
# LOCALS
# ===========================

locals {
  # Environment variables para DynamoDB Cook-to-Order
  environment_variables = {
    NODE_ENV       = var.environment
    DYNAMODB_TABLE = data.aws_dynamodb_table.cook_to_order.name
  }
}

# ===========================
# LAMBDA FUNCTION
# ===========================

resource "aws_lambda_function" "main" {
  function_name = var.lambda_function_name
  role         = data.aws_iam_role.lab_role.arn
  handler      = var.lambda_handler
  runtime      = var.lambda_runtime
  timeout      = var.lambda_timeout
  memory_size  = var.lambda_memory_size

  filename         = var.lambda_filename
  source_code_hash = filebase64sha256(var.lambda_filename)

  # Não precisa de VPC para DynamoDB

  environment {
    variables = local.environment_variables
  }

  tags = {
    Name        = var.lambda_function_name
    Environment = var.environment
    Service     = "cook-to-order"
    ManagedBy   = "terraform"
    Component   = "serverless"
    Project     = "fast-food"
  }
}

# ===========================
# CLOUDWATCH LOG GROUP
# ===========================

resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${var.lambda_function_name}"
  retention_in_days = 7

  tags = {
    Name        = "${var.lambda_function_name}-logs"
    Environment = var.environment
    Service     = var.service_type
    ManagedBy   = "terraform"
    Component   = "monitoring"
    Project     = "fast-food"
  }
}

# ===========================
# API GATEWAY
# ===========================

resource "aws_api_gateway_rest_api" "main" {
  name = var.api_gateway_name

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = {
    Name        = var.api_gateway_name
    Environment = var.environment
    Service     = var.service_type
    ManagedBy   = "terraform"
    Component   = "api-gateway"
    Project     = "fast-food"
  }
}

# API Gateway Resource
resource "aws_api_gateway_resource" "main" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = var.api_resource_path
}

# Health check resource
resource "aws_api_gateway_resource" "health" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.main.id
  path_part   = "health"
}

# Proxy resource para capturar subrotas
resource "aws_api_gateway_resource" "proxy_resource" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.main_resource.id
  path_part   = "{proxy+}"
}

# Method ANY para o recurso principal
resource "aws_api_gateway_method" "main_any" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.main_resource.id
  http_method   = "ANY"
  authorization = "NONE"
}

# Method ANY para proxy
resource "aws_api_gateway_method" "proxy_any" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.proxy_resource.id
  http_method   = "ANY"
  authorization = "NONE"
}

# Integration para recurso principal
resource "aws_api_gateway_integration" "main_integration" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.main_resource.id
  http_method = aws_api_gateway_method.main_any.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.main.invoke_arn
}

# Integration para proxy
resource "aws_api_gateway_integration" "proxy_integration" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.proxy_resource.id
  http_method = aws_api_gateway_method.proxy_any.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.main.invoke_arn
}

# CORS OPTIONS para recurso principal
resource "aws_api_gateway_method" "main_options" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.main_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "main_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.main_resource.id
  http_method = aws_api_gateway_method.main_options.http_method

  type = "MOCK"
  
  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
}

resource "aws_api_gateway_method_response" "main_options_response" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.main_resource.id
  http_method = aws_api_gateway_method.main_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
  }
}

resource "aws_api_gateway_integration_response" "main_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.main_resource.id
  http_method = aws_api_gateway_method.main_options.http_method
  status_code = aws_api_gateway_method_response.main_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST,PUT,DELETE'"
  }
}

# ===========================
# LAMBDA PERMISSIONS
# ===========================

resource "aws_lambda_permission" "api_gateway_main" {
  statement_id  = "AllowExecutionFromAPIGatewayMain"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.main.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# ===========================
# API GATEWAY DEPLOYMENT
# ===========================

resource "aws_api_gateway_deployment" "main" {
  depends_on = [
    aws_api_gateway_integration.main_integration,
    aws_api_gateway_integration.proxy_integration,
    aws_api_gateway_integration.health_get,
    aws_api_gateway_integration.main_options_integration
  ]

  rest_api_id = aws_api_gateway_rest_api.main.id
  stage_name  = var.environment

  lifecycle {
    create_before_destroy = true
  }
}

# ===========================
# HEALTH CHECK ENDPOINT
# ===========================

# Health check GET method
resource "aws_api_gateway_method" "health_get" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.health.id
  http_method   = "GET"
  authorization = "NONE"
}

# Health check integration
resource "aws_api_gateway_integration" "health_get" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.health.id
  http_method = aws_api_gateway_method.health_get.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.main.invoke_arn
}