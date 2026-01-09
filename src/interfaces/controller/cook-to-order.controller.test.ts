import { describe, expect, it, vi, beforeEach } from 'vitest';

import { ICreateCookToOrderUseCase } from '#/application/use-cases/cook-to-order/create-cook-to-order/create-cook-to-order.use-case';
import { IListCookToOrderUseCase } from '#/application/use-cases/cook-to-order/list-cook-to-order/list-cook-to-order.use-case';
import { IReadyCookToOrderUseCase } from '#/application/use-cases/cook-to-order/ready-cook-to-order/ready-cook-to-order.use-case';
import { IStartCookToOrderUseCase } from '#/application/use-cases/cook-to-order/start-cook-to-order/start-cook-to-order.use-case';
import { CookToOrder } from '#/domain/entities/cook-to-order.entity';
import { CookToOrderStatus } from '#/domain/enum/cook-to-order-status';
import { createLoggerMock } from '#/infrastructure/services/mocks/logger-mock.service';
import { CookToOrderController } from '#/interfaces/controller/cook-to-order.controller';

describe('CookToOrderController', () => {
    const createUseCaseMock = (): ICreateCookToOrderUseCase => ({
        execute: vi.fn(),
    });

    const listUseCaseMock = (): IListCookToOrderUseCase => ({
        execute: vi.fn(),
    });

    const startUseCaseMock = (): IStartCookToOrderUseCase => ({
        execute: vi.fn(),
    });

    const readyUseCaseMock = (): IReadyCookToOrderUseCase => ({
        execute: vi.fn(),
    });

    const loggerMock = createLoggerMock();
    const createCookToOrderUseCase = createUseCaseMock();
    const listCookToOrderUseCase = listUseCaseMock();
    const startCookToOrderUseCase = startUseCaseMock();
    const readyCookToOrderUseCase = readyUseCaseMock();

    const controller = new CookToOrderController(
        loggerMock,
        createCookToOrderUseCase,
        listCookToOrderUseCase,
        startCookToOrderUseCase,
        readyCookToOrderUseCase,
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

    describe('create', () => {
        it('should create a cook to order', async () => {
            vi.spyOn(createCookToOrderUseCase, 'execute').mockResolvedValueOnce();

            const request = {
                orderId: 'order-123',
                orderProducts: [{ name: 'Hamburger', quantity: 2 }],
            };

            await controller.create(request);

            expect(createCookToOrderUseCase.execute).toHaveBeenCalledWith(request);
            expect(loggerMock.info).toHaveBeenCalledWith('Creating a new cook to order', { request });
        });
    });

    describe('list', () => {
        it('should list cook to orders', async () => {
            vi.spyOn(listCookToOrderUseCase, 'execute').mockResolvedValueOnce([cookToOrderData]);

            const result = await controller.list();

            expect(listCookToOrderUseCase.execute).toHaveBeenCalledWith(undefined);
            expect(result).toHaveLength(1);
            expect(result[0].orderId).toBe('order-123');
        });
    });

    describe('startCookToOrder', () => {
        it('should start cook to order', async () => {
            vi.spyOn(startCookToOrderUseCase, 'execute').mockResolvedValueOnce();

            await controller.startCookToOrder('order-123');

            expect(startCookToOrderUseCase.execute).toHaveBeenCalledWith('order-123');
            expect(loggerMock.info).toHaveBeenCalledWith('Start cook order');
        });
    });

    describe('readyCookToOrder', () => {
        it('should mark cook to order as ready', async () => {
            vi.spyOn(readyCookToOrderUseCase, 'execute').mockResolvedValueOnce();

            await controller.readyCookToOrder('order-123');

            expect(readyCookToOrderUseCase.execute).toHaveBeenCalledWith('order-123');
            expect(loggerMock.info).toHaveBeenCalledWith('Ready cook order');
        });
    });
});
