import { CookToOrder } from '#/domain/entities/cook-to-order.entity';
import { CookToOrderResponse } from '#/interfaces/http/schemas/cook-to-order/cook-to-order-response.schema';

export class CookToOrderPresenter {
    static toHTTP(cookToOrder: CookToOrder): CookToOrderResponse {
        return {
            orderId: cookToOrder.orderId,
            items: cookToOrder.items,
            status: cookToOrder.status,
            createdAt: new Date(cookToOrder.createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            }),
        };
    }
}
