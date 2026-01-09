import { CookToOrderCreateRequest } from '#/interfaces/http/schemas/cook-to-order/cook-to-order-request.schema';

export interface ICreateCookToOrderUseCase {
    execute(request: CookToOrderCreateRequest): Promise<void>;
}
