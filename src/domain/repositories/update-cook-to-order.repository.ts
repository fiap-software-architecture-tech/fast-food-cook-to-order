import { CookToOrderDynamoDTO } from '#/domain/repositories/dto/cook-to-order-dynamo.dto';

export interface IUpdateCookToOrderRepository {
    execute(request: CookToOrderDynamoDTO): Promise<void>;
}
