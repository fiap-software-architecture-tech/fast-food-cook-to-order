import { CookToOrderDynamoDTO } from '#/domain/repositories/dto/cook-to-order-dynamo.dto';

export interface IPutCookToOrderRepository {
    execute(request: CookToOrderDynamoDTO): Promise<void>;
}
