export const TYPES = {
    // Repositories
    FindActiveCookToOrderRepository: Symbol.for('FindActiveCookToOrderRepository'),
    FindByIdCookToOrderRepository: Symbol.for('FindByIdCookToOrderRepository'),
    FindByStatusCookToOrderRepository: Symbol.for('FindByStatusCookToOrderRepository'),
    PutCookToOrderRepository: Symbol.for('PutCookToOrderRepository'),
    UpdateCookToOrderRepository: Symbol.for('UpdateCookToOrderRepository'),

    // Gateway
    UpdateOrderStatusGateway: Symbol.for('UpdateOrderStatusGateway'),

    // Services
    HttpClientService: Symbol.for('HttpClientService'),
    DynamoDBClient: Symbol.for('DynamoDBClient'),
    Logger: Symbol.for('Logger'),
} as const;
