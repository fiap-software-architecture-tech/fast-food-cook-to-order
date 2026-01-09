import { describe, expect, it, vi, beforeEach } from 'vitest';

import { CookToOrderStatus } from '#/domain/enum/cook-to-order-status';
import { InfrastructureError } from '#/domain/errors';
import { CookToOrderDynamoDTO } from '#/domain/repositories/dto/cook-to-order-dynamo.dto';
import { DynamoDbPutCookToOrderRepository } from '#/infrastructure/repositories/dynamodb/dynamodb-put-cook-to-order.repository';
import { createLoggerMock } from '#/infrastructure/services/mocks/logger-mock.service';

vi.mock('#/infrastructure/config/env', () => ({
    env: { AWS_DYNAMO_DB: 'test-table' },
}));

describe('DynamoDbPutCookToOrderRepository', () => {
    const createDynamoDBClientMock = () => ({
        get: vi.fn(),
        put: vi.fn(),
        query: vi.fn(),
        update: vi.fn(),
    });

    const loggerMock = createLoggerMock();
    const dynamoDBClientMock = createDynamoDBClientMock();

    const repository = new DynamoDbPutCookToOrderRepository(loggerMock, dynamoDBClientMock as any);

    const mockRequest: CookToOrderDynamoDTO = {
        pk: 'COOK_ORDER',
        sk: 'order-123#2025-01-09T12:00:00.000Z',
        orderId: 'order-123',
        status: CookToOrderStatus.RECEIVED,
        items: [{ name: 'Hamburger', quantity: 2 }],
        createdAt: 1736424000000,
        updatedAt: 1736424000000,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should put cook to order successfully', async () => {
        vi.spyOn(dynamoDBClientMock, 'put').mockResolvedValueOnce(undefined);

        await repository.execute(mockRequest);

        expect(dynamoDBClientMock.put).toHaveBeenCalled();
        expect(loggerMock.info).toHaveBeenCalledWith('Successfully put cook to order in DynamoDB', {
            request: mockRequest,
        });
    });

    it('should throw InfrastructureError when DynamoDB fails with Error', async () => {
        const error = new Error('DynamoDB connection failed');
        vi.spyOn(dynamoDBClientMock, 'put').mockRejectedValueOnce(error);

        await expect(repository.execute(mockRequest)).rejects.toThrow(InfrastructureError);

        expect(loggerMock.error).toHaveBeenCalled();
    });

    it('should throw InfrastructureError when DynamoDB fails with non-Error', async () => {
        vi.spyOn(dynamoDBClientMock, 'put').mockRejectedValueOnce('string error');

        await expect(repository.execute(mockRequest)).rejects.toThrow(InfrastructureError);

        expect(loggerMock.error).toHaveBeenCalled();
    });
});
