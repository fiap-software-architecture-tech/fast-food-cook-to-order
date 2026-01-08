import { CookToOrder } from '#/domain/entities/cook-to-order';

export interface IFindByIdCookToOrderRepository {
    execute(id: string): Promise<CookToOrder | null>;
}
