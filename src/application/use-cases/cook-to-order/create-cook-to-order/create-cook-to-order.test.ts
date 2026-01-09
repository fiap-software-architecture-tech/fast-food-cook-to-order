import { describe, expect, it, vi, beforeEach } from 'vitest';

import { CreateCookToOrder } from '#/application/use-cases/cook-to-order/create-cook-to-order/create-cook-to-order';
import { CookToOrderStatus } from '#/domain/enum/cook-to-order-status';
import { IUpdateOrderStatus } from '#/domain/gateways/order/update-order-status';
import * as cookToOrderMock from '#/infrastructure/repositories/dynamodb/mocks/dynamodb-cook-to-order-mock.repository';
import { createLoggerMock } from '#/infrastructure/services/mocks/logger-mock.service';

describe('CreateCookToOrder', () => {
    const createUpdateOrderStatusGatewayMock = (): IUpdateOrderStatus => ({
        execute: vi.fn(),
    });

    const loggerMock = createLoggerMock();
    const putCookToOrderRepository = new cookToOrderMock.DynamoDBPutCookToOrderMockRepository();
    const updateOrderStatusGateway = createUpdateOrderStatusGatewayMock();

    const createCookToOrderUseCase = new CreateCookToOrder(
        loggerMock,
        putCookToOrderRepository,
        updateOrderStatusGateway,
    );

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should create a cook to order successfully', async () => {
        const putMock = cookToOrderMock.mockPutCookToOrder();
        vi.spyOn(updateOrderStatusGateway, 'execute').mockResolvedValueOnce();

        await createCookToOrderUseCase.execute({
            orderId: 'order-123',
            orderProducts: [{ name: 'Hamburger', quantity: 2 }],
        });

        expect(putMock).toHaveBeenCalled();
        expect(updateOrderStatusGateway.execute).toHaveBeenCalledWith({
            orderId: 'order-123',
            status: CookToOrderStatus.RECEIVED,
        });
        expect(loggerMock.info).toHaveBeenCalledWith('Creating cook to order', { orderId: 'order-123' });
        expect(loggerMock.info).toHaveBeenCalledWith('Cook to order created successfully', { orderId: 'order-123' });
    });

    it('should throw error when repository fails', async () => {
        const error = new Error('Database error');
        vi.spyOn(putCookToOrderRepository, 'execute').mockRejectedValueOnce(error);

        await expect(
            createCookToOrderUseCase.execute({
                orderId: 'order-123',
                orderProducts: [{ name: 'Hamburger', quantity: 2 }],
            }),
        ).rejects.toThrow(error);

        expect(loggerMock.error).toHaveBeenCalledWith('Error creating cook to order', error, { orderId: 'order-123' });
    });
});
