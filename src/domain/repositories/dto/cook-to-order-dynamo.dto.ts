import { CookToOrderStatus } from '#/domain/enum/cook-to-order-status';

export interface CookToOrderDynamoDTO {
    pk: string;
    sk: string;
    orderId: string;
    status: CookToOrderStatus;
    items: Array<any>;
    createdAt: string;
    updatedAt: string;
}
