import { describe, expect, it, vi, beforeEach } from 'vitest';

import { ReadyCookToOrder } from '#/application/use-cases/cook-to-order/ready-cook-to-order/ready-cook-to-order';
import { CookToOrder } from '#/domain/entities/cook-to-order.entity';
import { CookToOrderStatus } from '#/domain/enum/cook-to-order-status';
import { NotFoundError } from '#/domain/errors';
import { IUpdateOrderStatus } from '#/domain/gateways/order/update-order-status';
import * as cookToOrderMock from '#/infrastructure/repositories/dynamodb/mocks/dynamodb-cook-to-order-mock.repository';
import { createLoggerMock } from '#/infrastructure/services/mocks/logger-mock.service';

describe('ReadyCookToOrder', () => {
    const createUpdateOrderStatusGatewayMock = (): IUpdateOrderStatus => ({
        execute: vi.fn(),
    });

    const loggerMock = createLoggerMock();
    const findByIdCookToOrderRepository = new cookToOrderMock.DynamoDBFindByIdCookToOrderMockRepository();
    const updateCookToOrderRepository = new cookToOrderMock.DynamoDBUpdateCookToOrderMockRepository();
    const updateOrderStatusGateway = createUpdateOrderStatusGatewayMock();

    const readyCookToOrderUseCase = new ReadyCookToOrder(
        loggerMock,
        findByIdCookToOrderRepository,
        updateCookToOrderRepository,
        updateOrderStatusGateway,
    );

    const cookToOrderData = new CookToOrder({
        orderId: 'order-123',
        items: [{ name: 'Hamburger', quantity: 2 }],
        status: CookToOrderStatus.IN_PROGRESS,
        createdAt: '2025-01-09T12:00:00.000Z',
        updatedAt: '2025-01-09T12:00:00.000Z',
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should mark cook to order as ready successfully', async () => {
        cookToOrderMock.mockFindByIdCookToOrder({ data: cookToOrderData });
        const updateMock = cookToOrderMock.mockUpdateCookToOrder();
        vi.spyOn(updateOrderStatusGateway, 'execute').mockResolvedValueOnce();

        await readyCookToOrderUseCase.execute('order-123');

        expect(updateMock).toHaveBeenCalled();
        expect(updateOrderStatusGateway.execute).toHaveBeenCalledWith({
            orderId: 'order-123',
            status: CookToOrderStatus.DONE,
        });
        expect(loggerMock.info).toHaveBeenCalledWith('Cook to order marked as ready', { id: 'order-123' });
    });

    it('should throw NotFoundError when cook to order does not exist', async () => {
        cookToOrderMock.mockFindByIdCookToOrder({ empty: true });

        await expect(readyCookToOrderUseCase.execute('order-123')).rejects.toThrow(NotFoundError);

        expect(loggerMock.warn).toHaveBeenCalledWith('Cook to order not found', { id: 'order-123' });
    });
});
