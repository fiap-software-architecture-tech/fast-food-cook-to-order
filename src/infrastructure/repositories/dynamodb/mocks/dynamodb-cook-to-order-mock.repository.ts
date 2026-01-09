import { vi } from 'vitest';

import { CookToOrder } from '#/domain/entities/cook-to-order.entity';
import { CookToOrderStatus } from '#/domain/enum/cook-to-order-status';
import { CookToOrderDynamoDTO } from '#/domain/repositories/dto/cook-to-order-dynamo.dto';
import { IFindActiveCookToOrderRepository } from '#/domain/repositories/find-active-cook-to-order.repository';
import { IFindByIdCookToOrderRepository } from '#/domain/repositories/find-by-id-cook-to-order.repository';
import { IFindByStatusCookToOrderRepository } from '#/domain/repositories/find-by-status-cook-to-order.repository';
import { IPutCookToOrderRepository } from '#/domain/repositories/put-cook-to-order.repository';
import { IUpdateCookToOrderRepository } from '#/domain/repositories/update-cook-to-order.repository';

export class DynamoDBPutCookToOrderMockRepository implements IPutCookToOrderRepository {
    async execute(_request: CookToOrderDynamoDTO): Promise<void> {
        return Promise.resolve();
    }
}

export class DynamoDBFindByIdCookToOrderMockRepository implements IFindByIdCookToOrderRepository {
    async execute(_id: string): Promise<CookToOrder | null> {
        return Promise.resolve(null);
    }
}

export class DynamoDBFindActiveCookToOrderMockRepository implements IFindActiveCookToOrderRepository {
    async execute(): Promise<CookToOrder[]> {
        return Promise.resolve([]);
    }
}

export class DynamoDBFindByStatusCookToOrderMockRepository implements IFindByStatusCookToOrderRepository {
    async execute(_status: CookToOrderStatus): Promise<CookToOrder[]> {
        return Promise.resolve([]);
    }
}

export class DynamoDBUpdateCookToOrderMockRepository implements IUpdateCookToOrderRepository {
    async execute(_request: CookToOrderDynamoDTO): Promise<void> {
        return Promise.resolve();
    }
}

const cookToOrderMock = new CookToOrder({
    orderId: 'order-123',
    items: [{ name: 'Hamburger', quantity: 2 }],
    status: CookToOrderStatus.RECEIVED,
    createdAt: '2025-01-09T12:00:00.000Z',
    updatedAt: '2025-01-09T12:00:00.000Z',
});

type MockOptions = {
    data?: CookToOrder;
    empty?: boolean;
};

type MockListOptions = {
    data?: CookToOrder[];
};

export function mockPutCookToOrder() {
    return vi.spyOn(DynamoDBPutCookToOrderMockRepository.prototype, 'execute').mockResolvedValueOnce();
}

export function mockFindByIdCookToOrder({ data = cookToOrderMock, empty }: MockOptions = {}) {
    return vi
        .spyOn(DynamoDBFindByIdCookToOrderMockRepository.prototype, 'execute')
        .mockResolvedValueOnce(empty ? null : data);
}

export function mockFindActiveCookToOrder({ data = [cookToOrderMock] }: MockListOptions = {}) {
    return vi.spyOn(DynamoDBFindActiveCookToOrderMockRepository.prototype, 'execute').mockResolvedValueOnce(data);
}

export function mockFindByStatusCookToOrder({ data = [cookToOrderMock] }: MockListOptions = {}) {
    return vi.spyOn(DynamoDBFindByStatusCookToOrderMockRepository.prototype, 'execute').mockResolvedValueOnce(data);
}

export function mockUpdateCookToOrder() {
    return vi.spyOn(DynamoDBUpdateCookToOrderMockRepository.prototype, 'execute').mockResolvedValueOnce();
}
