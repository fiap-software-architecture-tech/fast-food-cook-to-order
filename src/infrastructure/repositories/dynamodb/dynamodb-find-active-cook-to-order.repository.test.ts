import { describe, expect, it, vi, beforeEach } from 'vitest';

import { CookToOrderStatus } from '#/domain/enum/cook-to-order-status';
import { InfrastructureError } from '#/domain/errors';
import { DynamoDbFindActiveCookToOrderRepository } from '#/infrastructure/repositories/dynamodb/dynamodb-find-active-cook-to-order.repository';
import { createLoggerMock } from '#/infrastructure/services/mocks/logger-mock.service';

vi.mock('#/infrastructure/config/env', () => ({
    env: { AWS_DYNAMO_DB: 'test-table' },
}));

describe('DynamoDbFindActiveCookToOrderRepository', () => {
    const createDynamoDBClientMock = () => ({
        get: vi.fn(),
        put: vi.fn(),
        query: vi.fn(),
        update: vi.fn(),
    });

    const loggerMock = createLoggerMock();
    const dynamoDBClientMock = createDynamoDBClientMock();

    const repository = new DynamoDbFindActiveCookToOrderRepository(loggerMock, dynamoDBClientMock as any);

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

    it('should return active cook to orders', async () => {
        vi.spyOn(dynamoDBClientMock, 'query').mockResolvedValueOnce([mockDynamoData]);

        const result = await repository.execute();

        expect(result).toHaveLength(1);
        expect(result[0].orderId).toBe('order-123');
        expect(dynamoDBClientMock.query).toHaveBeenCalled();
        expect(loggerMock.info).toHaveBeenCalledWith('Active cook to orders found', { count: 1 });
    });

    it('should return empty array when no active orders found', async () => {
        vi.spyOn(dynamoDBClientMock, 'query').mockResolvedValueOnce([]);

        const result = await repository.execute();

        expect(result).toHaveLength(0);
        expect(loggerMock.info).toHaveBeenCalledWith('No active cook to orders found');
    });

    it('should throw InfrastructureError when DynamoDB fails with Error', async () => {
        const error = new Error('DynamoDB connection failed');
        vi.spyOn(dynamoDBClientMock, 'query').mockRejectedValueOnce(error);

        await expect(repository.execute()).rejects.toThrow(InfrastructureError);

        expect(loggerMock.error).toHaveBeenCalled();
    });

    it('should throw InfrastructureError when DynamoDB fails with non-Error', async () => {
        vi.spyOn(dynamoDBClientMock, 'query').mockRejectedValueOnce('string error');

        await expect(repository.execute()).rejects.toThrow(InfrastructureError);

        expect(loggerMock.error).toHaveBeenCalled();
    });
});
