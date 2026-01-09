import { CookToOrder } from '#/domain/entities/cook-to-order.entity';
import { CookToOrderStatus } from '#/domain/enum/cook-to-order-status';

export interface IFindByStatusCookToOrderRepository {
    execute(status: CookToOrderStatus): Promise<CookToOrder[]>;
}
