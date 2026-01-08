export const TYPES = {
    // Repositories
    PutCookToOrderRepository: Symbol.for('PutCookToOrderRepository'),

    // Gateway
    UpdateOrderStatusGateway: Symbol.for('UpdateOrderStatusGateway'),

    // Services
    HttpClientService: Symbol.for('HttpClientService'),
    DynamoDBClient: Symbol.for('DynamoDBClient'),
    Logger: Symbol.for('Logger'),
} as const;
