import { CookToOrder } from '#/domain/entities/cook-to-order.entity';
import { CookToOrderDynamoDTO } from '#/domain/repositories/dto/cook-to-order-dynamo.dto';

export class CookToOrderMapper {
    static toDomain(data: CookToOrderDynamoDTO): CookToOrder {
        if (!data) {
            throw new Error('Invalid data for CookToOrder mapping');
        }

        return new CookToOrder({
            orderId: data.orderId,
            status: data.status,
            items: data.items || [],
            createdAt: new Date(data.createdAt).toISOString(),
            updatedAt: new Date(data.updatedAt).toISOString(),
        });
    }

    static toDynamoDB(cookToOrder: CookToOrder): CookToOrderDynamoDTO {
        return {
            pk: 'COOK_ORDER',
            sk: `${cookToOrder.orderId}#${cookToOrder.createdAt}`,
            orderId: cookToOrder.orderId,
            status: cookToOrder.status,
            items: cookToOrder.items,
            createdAt: new Date(cookToOrder.createdAt).getTime(),
            updatedAt: new Date(cookToOrder.updatedAt).getTime(),
        };
    }
}
