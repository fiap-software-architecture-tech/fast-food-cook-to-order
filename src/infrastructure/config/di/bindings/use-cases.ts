import { Container } from 'inversify';

import { CreateCookToOrder } from '#/application/use-cases/cook-to-order/create-cook-to-order/create-cook-to-order';
import { ICreateCookToOrderUseCase } from '#/application/use-cases/cook-to-order/create-cook-to-order/create-cook-to-order.use-case';
import { ListCookToOrder } from '#/application/use-cases/cook-to-order/list-cook-to-order/list-cook-to-order';
import { IListCookToOrderUseCase } from '#/application/use-cases/cook-to-order/list-cook-to-order/list-cook-to-order.use-case';
import { ReadyCookToOrder } from '#/application/use-cases/cook-to-order/ready-cook-to-order/ready-cook-to-order';
import { IReadyCookToOrderUseCase } from '#/application/use-cases/cook-to-order/ready-cook-to-order/ready-cook-to-order.use-case';
import { StartCookToOrder } from '#/application/use-cases/cook-to-order/start-cook-to-order/start-cook-to-order';
import { IStartCookToOrderUseCase } from '#/application/use-cases/cook-to-order/start-cook-to-order/start-cook-to-order.use-case';
import { TYPES } from '#/infrastructure/config/di/types';

export function bindUseCases(container: Container) {
    container.bind<ICreateCookToOrderUseCase>(TYPES.CreateCookToOrderUseCase).to(CreateCookToOrder).inTransientScope();
    container.bind<IListCookToOrderUseCase>(TYPES.ListCookToOrderUseCase).to(ListCookToOrder).inTransientScope();
    container.bind<IReadyCookToOrderUseCase>(TYPES.ReadyCookToOrderUseCase).to(ReadyCookToOrder).inTransientScope();
    container.bind<IStartCookToOrderUseCase>(TYPES.StartCookToOrderUseCase).to(StartCookToOrder).inTransientScope();
}
