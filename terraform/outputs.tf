# ===========================
# LAMBDA OUTPUTS
# ===========================

output "lambda_function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.main.function_name
}

output "lambda_function_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.main.arn
}

output "lambda_invoke_arn" {
  description = "Invoke ARN of the Lambda function"
  value       = aws_lambda_function.main.invoke_arn
}

# ===========================
# API GATEWAY OUTPUTS
# ===========================

output "api_gateway_id" {
  description = "ID of the API Gateway"
  value       = aws_api_gateway_rest_api.main.id
}

output "api_gateway_url" {
  description = "URL of the API Gateway"
  value       = aws_api_gateway_deployment.main.invoke_url
}

output "api_gateway_endpoint" {
  description = "Full endpoint URL"
  value       = "${aws_api_gateway_deployment.main.invoke_url}/${var.api_resource_path}"
}

# ===========================
# DATABASE CONFIG OUTPUTS (específico para DynamoDB)
# ===========================

output "dynamodb_table_name" {
  description = "Nome da tabela DynamoDB"
  value       = data.aws_dynamodb_table.cook_to_order.name
}

output "dynamodb_table_arn" {
  description = "ARN da tabela DynamoDB"
  value       = data.aws_dynamodb_table.cook_to_order.arn
}

output "environment_variables" {
  description = "Environment variables set in Lambda"
  value = {
    DYNAMODB_TABLE = data.aws_dynamodb_table.cook_to_order.name
    NODE_ENV       = var.environment
  }
  sensitive = false  # DynamoDB não tem credenciais sensíveis
}