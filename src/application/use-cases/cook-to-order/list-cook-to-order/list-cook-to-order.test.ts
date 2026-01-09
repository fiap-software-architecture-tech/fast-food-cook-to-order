import { describe, expect, it, vi, beforeEach } from 'vitest';

import { ListCookToOrder } from '#/application/use-cases/cook-to-order/list-cook-to-order/list-cook-to-order';
import { CookToOrder } from '#/domain/entities/cook-to-order.entity';
import { CookToOrderStatus } from '#/domain/enum/cook-to-order-status';
import * as cookToOrderMock from '#/infrastructure/repositories/dynamodb/mocks/dynamodb-cook-to-order-mock.repository';
import { createLoggerMock } from '#/infrastructure/services/mocks/logger-mock.service';

describe('ListCookToOrder', () => {
    const loggerMock = createLoggerMock();
    const findActiveCookToOrderRepository = new cookToOrderMock.DynamoDBFindActiveCookToOrderMockRepository();
    const findByStatusCookToOrderRepository = new cookToOrderMock.DynamoDBFindByStatusCookToOrderMockRepository();

    const listCookToOrderUseCase = new ListCookToOrder(
        loggerMock,
        findActiveCookToOrderRepository,
        findByStatusCookToOrderRepository,
    );

    const cookToOrderData = new CookToOrder({
        orderId: 'order-123',
        items: [{ name: 'Hamburger', quantity: 2 }],
        status: CookToOrderStatus.RECEIVED,
        createdAt: '2025-01-09T12:00:00.000Z',
        updatedAt: '2025-01-09T12:00:00.000Z',
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should list active cook to orders when no status is provided', async () => {
        cookToOrderMock.mockFindActiveCookToOrder({ data: [cookToOrderData] });

        const result = await listCookToOrderUseCase.execute();

        expect(result).toHaveLength(1);
        expect(result[0].orderId).toBe('order-123');
        expect(loggerMock.info).toHaveBeenCalledWith('Found active cook to orders', { count: 1 });
    });

    it('should list cook to orders by status when status is provided', async () => {
        cookToOrderMock.mockFindByStatusCookToOrder({ data: [cookToOrderData] });

        const result = await listCookToOrderUseCase.execute(CookToOrderStatus.RECEIVED);

        expect(result).toHaveLength(1);
        expect(result[0].status).toBe(CookToOrderStatus.RECEIVED);
        expect(loggerMock.info).toHaveBeenCalledWith('Found cook to orders by status', {
            status: CookToOrderStatus.RECEIVED,
            count: 1,
        });
    });

    it('should throw error when repository fails', async () => {
        const error = new Error('Database error');
        vi.spyOn(findActiveCookToOrderRepository, 'execute').mockRejectedValueOnce(error);

        await expect(listCookToOrderUseCase.execute()).rejects.toThrow(error);

        expect(loggerMock.error).toHaveBeenCalledWith('Error listing cook to order', error, { status: undefined });
    });
});
