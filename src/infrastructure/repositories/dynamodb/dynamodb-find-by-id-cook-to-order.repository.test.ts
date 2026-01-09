import { describe, expect, it, vi, beforeEach } from 'vitest';

import { CookToOrderStatus } from '#/domain/enum/cook-to-order-status';
import { InfrastructureError } from '#/domain/errors';
import { DynamoDbFindByIdCookToOrderRepository } from '#/infrastructure/repositories/dynamodb/dynamodb-find-by-id-cook-to-order.repository';
import { createLoggerMock } from '#/infrastructure/services/mocks/logger-mock.service';

vi.mock('#/infrastructure/config/env', () => ({
    env: { AWS_DYNAMO_DB: 'test-table' },
}));

describe('DynamoDbFindByIdCookToOrderRepository', () => {
    const createDynamoDBClientMock = () => ({
        get: vi.fn(),
        put: vi.fn(),
        query: vi.fn(),
        update: vi.fn(),
    });

    const loggerMock = createLoggerMock();
    const dynamoDBClientMock = createDynamoDBClientMock();

    const repository = new DynamoDbFindByIdCookToOrderRepository(loggerMock, dynamoDBClientMock as any);

    const mockDynamoData = {
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

    it('should return cook to order by id', async () => {
        vi.spyOn(dynamoDBClientMock, 'get').mockResolvedValueOnce(mockDynamoData);

        const result = await repository.execute('order-123#2025-01-09T12:00:00.000Z');

        expect(result).not.toBeNull();
        expect(result?.orderId).toBe('order-123');
        expect(dynamoDBClientMock.get).toHaveBeenCalled();
        expect(loggerMock.info).toHaveBeenCalledWith('Successfully found cook to order in DynamoDB', {
            id: 'order-123#2025-01-09T12:00:00.000Z',
        });
    });

    it('should return null when cook to order not found', async () => {
        vi.spyOn(dynamoDBClientMock, 'get').mockResolvedValueOnce(null);

        const result = await repository.execute('non-existent-id');

        expect(result).toBeNull();
        expect(loggerMock.info).toHaveBeenCalledWith('Cook to order not found', { id: 'non-existent-id' });
    });

    it('should throw InfrastructureError when DynamoDB fails with Error', async () => {
        const error = new Error('DynamoDB connection failed');
        vi.spyOn(dynamoDBClientMock, 'get').mockRejectedValueOnce(error);

        await expect(repository.execute('order-123')).rejects.toThrow(InfrastructureError);

        expect(loggerMock.error).toHaveBeenCalled();
    });

    it('should throw InfrastructureError when DynamoDB fails with non-Error', async () => {
        vi.spyOn(dynamoDBClientMock, 'get').mockRejectedValueOnce('string error');

        await expect(repository.execute('order-123')).rejects.toThrow(InfrastructureError);

        expect(loggerMock.error).toHaveBeenCalled();
    });
});
