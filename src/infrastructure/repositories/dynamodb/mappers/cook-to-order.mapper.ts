import { CookToOrder } from '#/domain/entities/cook-to-order';
import { CookToOrderDynamoDTO } from '#/domain/repositories/dto/cook-to-order-dynamo.dto';

export class CookToOrderMapper {
    static toDomain(data: any): CookToOrder {
        if (!data) {
            throw new Error('Invalid data for CookToOrder mapping');
        }

        return new CookToOrder({
            orderId: data.orderId,
            status: data.status,
            items: data.items || [],
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt),
        });
    }

    static toDynamoDB(cookToOrder: CookToOrder): CookToOrderDynamoDTO {
        return {
            pk: 'COOK_ORDER',
            sk: `${cookToOrder.orderId}#${cookToOrder.createdAt.toISOString()}`,
            orderId: cookToOrder.orderId,
            status: cookToOrder.status,
            items: cookToOrder.items,
            createdAt: cookToOrder.createdAt.toISOString(),
            updatedAt: cookToOrder.updatedAt.toISOString(),
        };
    }
}
