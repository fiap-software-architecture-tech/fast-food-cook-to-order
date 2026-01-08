import { Container } from 'inversify';

import { IPutCookToOrderRepository } from '#/domain/repositories/put-cook-to-order.repository';
import { TYPES } from '#/infrastructure/config/di/types';
import { DynamoDbPutCookToOrderRepository } from '#/infrastructure/repositories/dynamodb/dynamodb-put-cook-to-order.repository';

export function bindRepositories(container: Container) {
    container
        .bind<IPutCookToOrderRepository>(TYPES.PutCookToOrderRepository)
        .to(DynamoDbPutCookToOrderRepository)
        .inSingletonScope();
}
