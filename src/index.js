const AWS = require('aws-sdk');

// Configurar DynamoDB
const dynamodb = new AWS.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION
});

// Cliente DynamoDB normal para operações de describe
const dynamodbClient = new AWS.DynamoDB({
    region: process.env.AWS_REGION
});

const tableName = process.env.DYNAMODB_TABLE;

// Lambda handler for cook-to-order service
exports.handler = async (event, context) => {
    console.log('Event received:', JSON.stringify(event, null, 2));
    
    const { httpMethod, path, body } = event;
    
    try {
        let response;
        
        switch (httpMethod) {
            case 'GET':
                if (path.includes('/health') || path.includes('/test-connection')) {
                    // Test DynamoDB connection
                    response = await testDynamoConnection();
                } else if (path === '/cook-to-order' || path === '/production/cook-to-order') {
                    // List all cook-to-order items
                    const params = {
                        TableName: tableName
                    };
                    
                    const result = await dynamodb.scan(params).promise();
                    
                    response = {
                        statusCode: 200,
                        body: JSON.stringify({
                            message: 'Cook-to-order items retrieved successfully',
                            data: result.Items,
                            count: result.Count
                        })
                    };
                } else if (path.includes('/cook-to-order/') && !path.includes('/status')) {
                    // Get specific cook-to-order item
                    const pathParts = path.split('/');
                    const orderId = pathParts[pathParts.indexOf('cook-to-order') + 1];
                    
                    const params = {
                        TableName: tableName,
                        Key: {
                            order_id: orderId
                        }
                    };
                    
                    const result = await dynamodb.get(params).promise();
                    
                    if (result.Item) {
                        response = {
                            statusCode: 200,
                            body: JSON.stringify({
                                message: 'Cook-to-order item found',
                                data: result.Item
                            })
                        };
                    } else {
                        response = {
                            statusCode: 404,
                            body: JSON.stringify({ message: 'Cook-to-order item not found' })
                        };
                    }
                } else {
                    response = {
                        statusCode: 404,
                        body: JSON.stringify({ message: 'Endpoint not found' })
                    };
                }
                break;
                
            case 'POST':
                if (path === '/cook-to-order' || path === '/production/cook-to-order') {
                    // Create new cook-to-order item
                    const orderData = JSON.parse(body);
                    const { order_id, customer_id, items, priority = 'normal' } = orderData;
                    
                    const params = {
                        TableName: tableName,
                        Item: {
                            order_id: order_id,
                            customer_id: customer_id,
                            items: items,
                            priority: priority,
                            status: 'queued',
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }
                    };
                    
                    await dynamodb.put(params).promise();
                    
                    response = {
                        statusCode: 201,
                        body: JSON.stringify({
                            message: 'Cook-to-order item created successfully',
                            order_id: order_id,
                            status: 'queued'
                        })
                    };
                } else {
                    response = {
                        statusCode: 404,
                        body: JSON.stringify({ message: 'Endpoint not found' })
                    };
                }
                break;
                
            case 'PUT':
                if (path.includes('/cook-to-order/') && path.includes('/status')) {
                    // Update cook-to-order status
                    const pathParts = path.split('/');
                    const orderId = pathParts[pathParts.indexOf('cook-to-order') + 1];
                    const { status } = JSON.parse(body);
                    
                    const params = {
                        TableName: tableName,
                        Key: {
                            order_id: orderId
                        },
                        UpdateExpression: 'SET #status = :status, updated_at = :updated_at',
                        ExpressionAttributeNames: {
                            '#status': 'status'
                        },
                        ExpressionAttributeValues: {
                            ':status': status,
                            ':updated_at': new Date().toISOString()
                        },
                        ReturnValues: 'UPDATED_NEW'
                    };
                    
                    await dynamodb.update(params).promise();
                    
                    response = {
                        statusCode: 200,
                        body: JSON.stringify({
                            message: 'Cook-to-order status updated successfully',
                            order_id: orderId,
                            new_status: status
                        })
                    };
                } else {
                    response = {
                        statusCode: 404,
                        body: JSON.stringify({ message: 'Endpoint not found' })
                    };
                }
                break;
                
            case 'DELETE':
                if (path.includes('/cook-to-order/')) {
                    // Delete cook-to-order item
                    const pathParts = path.split('/');
                    const orderId = pathParts[pathParts.indexOf('cook-to-order') + 1];
                    
                    const params = {
                        TableName: tableName,
                        Key: {
                            order_id: orderId
                        }
                    };
                    
                    await dynamodb.delete(params).promise();
                    
                    response = {
                        statusCode: 200,
                        body: JSON.stringify({
                            message: 'Cook-to-order item deleted successfully',
                            order_id: orderId
                        })
                    };
                } else {
                    response = {
                        statusCode: 404,
                        body: JSON.stringify({ message: 'Endpoint not found' })
                    };
                }
                break;
                
            default:
                response = {
                    statusCode: 405,
                    body: JSON.stringify({ message: 'Method not allowed' })
                };
        }
        
        return {
            ...response,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
            }
        };
        
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                message: 'Internal server error',
                error: error.message
            })
        };
    }
};

// Function to test DynamoDB connection
async function testDynamoConnection() {
    try {
        console.log('Testing DynamoDB connection...');
        console.log('Table:', tableName);
        console.log('Region:', process.env.AWS_REGION);
        
        // Test table access with a simple describe operation
        const params = {
            TableName: tableName,
            Limit: 1
        };
        
        const result = await dynamodb.scan(params).promise();
        console.log('✅ DynamoDB connection successful');

        // Usar o cliente normal para describe table
        const describeParams = { TableName: tableName };
        const tableInfo = await dynamodbClient.describeTable(describeParams).promise();
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                status: 'success',
                message: 'DynamoDB connection successful',
                service: 'fast-food-cook-to-order',
                connection_info: {
                    table_name: tableName,
                    region: process.env.AWS_REGION,
                    table_status: tableInfo.Table.TableStatus,
                    item_count: tableInfo.Table.ItemCount
                },
                test_result: {
                    scanned_count: result.ScannedCount,
                    items_returned: result.Items.length
                },
                timestamp: new Date().toISOString()
            })
        };
    } catch (error) {
        console.error('❌ DynamoDB connection failed:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                status: 'error',
                message: 'DynamoDB connection failed',
                service: 'fast-food-cook-to-order',
                error: error.message,
                connection_info: {
                    table_name: tableName,
                    region: process.env.AWS_REGION
                },
                timestamp: new Date().toISOString()
            })
        };
    }
}