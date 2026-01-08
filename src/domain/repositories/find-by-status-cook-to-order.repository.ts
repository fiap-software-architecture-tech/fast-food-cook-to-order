import { CookToOrder } from '#/domain/entities/cook-to-order';
import { CookToOrderStatus } from '#/domain/enum/cook-to-order-status';

export interface IFindByStatusCookToOrderRepository {
    execute(status: CookToOrderStatus): Promise<CookToOrder[]>;
}
