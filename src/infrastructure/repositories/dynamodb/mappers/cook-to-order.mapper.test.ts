import { describe, expect, it } from 'vitest';

import { CookToOrder } from '#/domain/entities/cook-to-order.entity';
import { CookToOrderStatus } from '#/domain/enum/cook-to-order-status';
import { CookToOrderMapper } from '#/infrastructure/repositories/dynamodb/mappers/cook-to-order.mapper';

describe('CookToOrderMapper', () => {
    const mockDynamoData = {
        pk: 'COOK_ORDER',
        sk: 'order-123#2025-01-09T12:00:00.000Z',
        orderId: 'order-123',
        status: CookToOrderStatus.RECEIVED,
        items: [{ name: 'Hamburger', quantity: 2 }],
        createdAt: 1736424000000,
        updatedAt: 1736424000000,
    };

    describe('toDomain', () => {
        it('should map DynamoDB data to domain CookToOrder entity', () => {
            const cookToOrder = CookToOrderMapper.toDomain(mockDynamoData);

            expect(cookToOrder).toBeInstanceOf(CookToOrder);
            expect(cookToOrder.orderId).toBe(mockDynamoData.orderId);
            expect(cookToOrder.status).toBe(mockDynamoData.status);
            expect(cookToOrder.items).toEqual(mockDynamoData.items);
        });

        it('should throw error when data is invalid', () => {
            expect(() => CookToOrderMapper.toDomain(null as any)).toThrow('Invalid data for CookToOrder mapping');
        });

        it('should handle data with undefined items', () => {
            const dataWithoutItems = {
                ...mockDynamoData,
                items: undefined,
            };

            const cookToOrder = CookToOrderMapper.toDomain(dataWithoutItems as any);

            expect(cookToOrder.items).toEqual([]);
        });
    });

    describe('toDynamoDB', () => {
        it('should map domain CookToOrder to DynamoDB format', () => {
            const cookToOrder = new CookToOrder({
                orderId: 'order-456',
                items: [{ name: 'Pizza', quantity: 1 }],
                status: CookToOrderStatus.IN_PROGRESS,
                createdAt: '2025-01-09T12:00:00.000Z',
                updatedAt: '2025-01-09T12:30:00.000Z',
            });

            const dynamoData = CookToOrderMapper.toDynamoDB(cookToOrder);

            expect(dynamoData.pk).toBe('COOK_ORDER');
            expect(dynamoData.sk).toBe('order-456#2025-01-09T12:00:00.000Z');
            expect(dynamoData.orderId).toBe('order-456');
            expect(dynamoData.status).toBe(CookToOrderStatus.IN_PROGRESS);
            expect(dynamoData.items).toEqual([{ name: 'Pizza', quantity: 1 }]);
        });
    });
});
