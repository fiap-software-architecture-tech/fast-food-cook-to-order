import { CookToOrder } from '#/domain/entities/cook-to-order.entity';

export interface IFindActiveCookToOrderRepository {
    execute(): Promise<CookToOrder[]>;
}
