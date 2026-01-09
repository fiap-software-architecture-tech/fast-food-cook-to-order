import { CookToOrder } from '#/domain/entities/cook-to-order.entity';
import { CookToOrderStatus } from '#/domain/enum/cook-to-order-status';
import { CookToOrderDynamoDTO } from '#/domain/repositories/dto/cook-to-order-dynamo.dto';

export class CookToOrderMapper {
    static toDomain(data: CookToOrderDynamoDTO): CookToOrder {
        if (!data) {
            throw new Error('Invalid data for CookToOrder mapping');
        }

        return new CookToOrder({
            orderId: data.orderId,
            status: CookToOrderStatus[data.status as keyof typeof CookToOrderStatus],
            items: data.items || [],
            createdAt: new Date(data.createdAt).toISOString(),
            updatedAt: new Date(data.updatedAt).toISOString(),
        });
    }

    static toDynamoDB(cookToOrder: CookToOrder): CookToOrderDynamoDTO {
        const createdAtTimestamp = new Date(cookToOrder.createdAt).getTime();
        const updatedAtTimestamp = new Date(cookToOrder.updatedAt).getTime();

        return {
            pk: 'COOK_ORDER',
            orderId: cookToOrder.orderId,
            status: cookToOrder.status,
            items: cookToOrder.items,
            createdAt: createdAtTimestamp,
            updatedAt: updatedAtTimestamp,
        };
    }
}
