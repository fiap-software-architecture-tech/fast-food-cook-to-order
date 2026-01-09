import { describe, expect, it, vi, beforeEach } from 'vitest';

import { CookToOrderStatus } from '#/domain/enum/cook-to-order-status';
import { InfrastructureError } from '#/domain/errors';
import { DynamoDbFindByStatusCookToOrderRepository } from '#/infrastructure/repositories/dynamodb/dynamodb-find-by-status-cook-to-order.repository';
import { createLoggerMock } from '#/infrastructure/services/mocks/logger-mock.service';

vi.mock('#/infrastructure/config/env', () => ({
    env: { AWS_DYNAMO_DB: 'test-table' },
}));

describe('DynamoDbFindByStatusCookToOrderRepository', () => {
    const createDynamoDBClientMock = () => ({
        get: vi.fn(),
        put: vi.fn(),
        query: vi.fn(),
        update: vi.fn(),
    });

    const loggerMock = createLoggerMock();
    const dynamoDBClientMock = createDynamoDBClientMock();

    const repository = new DynamoDbFindByStatusCookToOrderRepository(loggerMock, dynamoDBClientMock as any);

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

    it('should return cook to orders by status', async () => {
        vi.spyOn(dynamoDBClientMock, 'query').mockResolvedValueOnce([mockDynamoData]);

        const result = await repository.execute(CookToOrderStatus.RECEIVED);

        expect(result).toHaveLength(1);
        expect(result[0].status).toBe(CookToOrderStatus.RECEIVED);
        expect(dynamoDBClientMock.query).toHaveBeenCalled();
        expect(loggerMock.info).toHaveBeenCalledWith('Successfully found cook to order in DynamoDB', {
            status: CookToOrderStatus.RECEIVED,
        });
    });

    it('should return empty array when no orders found for status', async () => {
        vi.spyOn(dynamoDBClientMock, 'query').mockResolvedValueOnce([]);

        const result = await repository.execute(CookToOrderStatus.IN_PROGRESS);

        expect(result).toHaveLength(0);
        expect(loggerMock.info).toHaveBeenCalledWith('No cook to orders found for status', {
            status: CookToOrderStatus.IN_PROGRESS,
        });
    });

    it('should throw InfrastructureError when DynamoDB fails with Error', async () => {
        const error = new Error('DynamoDB connection failed');
        vi.spyOn(dynamoDBClientMock, 'query').mockRejectedValueOnce(error);

        await expect(repository.execute(CookToOrderStatus.RECEIVED)).rejects.toThrow(InfrastructureError);

        expect(loggerMock.error).toHaveBeenCalled();
    });

    it('should throw InfrastructureError when DynamoDB fails with non-Error', async () => {
        vi.spyOn(dynamoDBClientMock, 'query').mockRejectedValueOnce('string error');

        await expect(repository.execute(CookToOrderStatus.RECEIVED)).rejects.toThrow(InfrastructureError);

        expect(loggerMock.error).toHaveBeenCalled();
    });
});
