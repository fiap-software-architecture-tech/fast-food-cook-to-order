import { CookToOrder } from '#/domain/entities/cook-to-order';

export interface IFindActiveCookToOrderRepository {
    execute(): Promise<CookToOrder[]>;
}
