import { Container } from 'inversify';

import { IUpdateOrderStatus } from '#/domain/gateways/order/update-order-status';
import { TYPES } from '#/infrastructure/config/di/types';
import { FastFoodOrderUpdateOrderStatus } from '#/infrastructure/gateways/fast-food-order/fast-food-order-update-order-status';

export function bindGateways(container: Container) {
    container
        .bind<IUpdateOrderStatus>(TYPES.UpdateOrderStatusGateway)
        .to(FastFoodOrderUpdateOrderStatus)
        .inTransientScope();
}
