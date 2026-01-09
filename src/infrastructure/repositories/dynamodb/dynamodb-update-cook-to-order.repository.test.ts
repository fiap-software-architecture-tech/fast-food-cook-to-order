import { describe, expect, it, vi, beforeEach } from 'vitest';

import { CookToOrderStatus } from '#/domain/enum/cook-to-order-status';
import { InfrastructureError } from '#/domain/errors';
import { CookToOrderDynamoDTO } from '#/domain/repositories/dto/cook-to-order-dynamo.dto';
import { DynamoDbUpdateCookToOrderRepository } from '#/infrastructure/repositories/dynamodb/dynamodb-update-cook-to-order.repository';
import { createLoggerMock } from '#/infrastructure/services/mocks/logger-mock.service';

vi.mock('#/infrastructure/config/env', () => ({
    env: { AWS_DYNAMO_DB: 'test-table' },
}));

describe('DynamoDbUpdateCookToOrderRepository', () => {
    const createDynamoDBClientMock = () => ({
        get: vi.fn(),
        put: vi.fn(),
        query: vi.fn(),
        update: vi.fn(),
    });

    const loggerMock = createLoggerMock();
    const dynamoDBClientMock = createDynamoDBClientMock();

    const repository = new DynamoDbUpdateCookToOrderRepository(loggerMock, dynamoDBClientMock as any);

    const mockRequest: CookToOrderDynamoDTO = {
        pk: 'COOK_ORDER',
        orderId: 'order-123',
        status: CookToOrderStatus.IN_PROGRESS,
        items: [{ name: 'Hamburger', quantity: 2 }],
        createdAt: 1736424000000,
        updatedAt: 1736424000000,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should update cook to order successfully with IN_PROGRESS status', async () => {
        vi.spyOn(dynamoDBClientMock, 'update').mockResolvedValueOnce(undefined);

        await repository.execute(mockRequest);

        expect(dynamoDBClientMock.update).toHaveBeenCalled();
        expect(loggerMock.info).toHaveBeenCalledWith('Successfully updated cook to order in DynamoDB', {
            request: mockRequest,
        });
    });

    it('should update cook to order with DONE status setting queueStatus to DONE', async () => {
        vi.spyOn(dynamoDBClientMock, 'update').mockResolvedValueOnce(undefined);

        const readyRequest: CookToOrderDynamoDTO = {
            ...mockRequest,
            status: CookToOrderStatus.DONE,
        };

        await repository.execute(readyRequest);

        expect(dynamoDBClientMock.update).toHaveBeenCalled();
        expect(loggerMock.info).toHaveBeenCalledWith('Successfully updated cook to order in DynamoDB', {
            request: readyRequest,
        });
    });

    it('should throw InfrastructureError when DynamoDB fails with Error', async () => {
        const error = new Error('DynamoDB connection failed');
        vi.spyOn(dynamoDBClientMock, 'update').mockRejectedValueOnce(error);

        await expect(repository.execute(mockRequest)).rejects.toThrow(InfrastructureError);

        expect(loggerMock.error).toHaveBeenCalled();
    });

    it('should throw InfrastructureError when DynamoDB fails with non-Error', async () => {
        vi.spyOn(dynamoDBClientMock, 'update').mockRejectedValueOnce('string error');

        await expect(repository.execute(mockRequest)).rejects.toThrow(InfrastructureError);

        expect(loggerMock.error).toHaveBeenCalled();
    });
});
