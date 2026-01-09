import { Container } from 'inversify';

import { TYPES } from '#/infrastructure/config/di/types';
import { CookToOrderController } from '#/interfaces/controller/cook-to-order.controller';

export function bindControllers(container: Container) {
    container.bind<CookToOrderController>(TYPES.CookToOrderController).to(CookToOrderController).inTransientScope();
}
