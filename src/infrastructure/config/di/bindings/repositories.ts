import { Container } from 'inversify';

import { IFindActiveCookToOrderRepository } from '#/domain/repositories/find-active-cook-to-order.repository';
import { IFindByIdCookToOrderRepository } from '#/domain/repositories/find-by-id-cook-to-order.repository';
import { IFindByStatusCookToOrderRepository } from '#/domain/repositories/find-by-status-cook-to-order.repository';
import { IPutCookToOrderRepository } from '#/domain/repositories/put-cook-to-order.repository';
import { IUpdateCookToOrderRepository } from '#/domain/repositories/update-cook-to-order.repository';
import { TYPES } from '#/infrastructure/config/di/types';
import { DynamoDbFindActiveCookToOrderRepository } from '#/infrastructure/repositories/dynamodb/dynamodb-find-active-cook-to-order.repository';
import { DynamoDbFindByIdCookToOrderRepository } from '#/infrastructure/repositories/dynamodb/dynamodb-find-by-id-cook-to-order.repository';
import { DynamoDbFindByStatusCookToOrderRepository } from '#/infrastructure/repositories/dynamodb/dynamodb-find-by-status-cook-to-order.repository';
import { DynamoDbPutCookToOrderRepository } from '#/infrastructure/repositories/dynamodb/dynamodb-put-cook-to-order.repository';
import { DynamoDbUpdateCookToOrderRepository } from '#/infrastructure/repositories/dynamodb/dynamodb-update-cook-to-order.repository';

export function bindRepositories(container: Container) {
    container
        .bind<IFindActiveCookToOrderRepository>(TYPES.FindActiveCookToOrderRepository)
        .to(DynamoDbFindActiveCookToOrderRepository)
        .inSingletonScope();
    container
        .bind<IFindByIdCookToOrderRepository>(TYPES.FindByIdCookToOrderRepository)
        .to(DynamoDbFindByIdCookToOrderRepository)
        .inSingletonScope();
    container
        .bind<IFindByStatusCookToOrderRepository>(TYPES.FindByStatusCookToOrderRepository)
        .to(DynamoDbFindByStatusCookToOrderRepository)
        .inSingletonScope();
    container
        .bind<IPutCookToOrderRepository>(TYPES.PutCookToOrderRepository)
        .to(DynamoDbPutCookToOrderRepository)
        .inSingletonScope();
    container
        .bind<IUpdateCookToOrderRepository>(TYPES.PutCookToOrderRepository)
        .to(DynamoDbUpdateCookToOrderRepository)
        .inSingletonScope();
}
