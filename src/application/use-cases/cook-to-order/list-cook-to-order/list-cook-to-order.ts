import { inject, injectable } from 'inversify';

import { IListCookToOrderUseCase } from '#/application/use-cases/cook-to-order/list-cook-to-order/list-cook-to-order.use-case';
import { CookToOrder } from '#/domain/entities/cook-to-order.entity';
import { CookToOrderStatus } from '#/domain/enum/cook-to-order-status';
import { IFindActiveCookToOrderRepository } from '#/domain/repositories/find-active-cook-to-order.repository';
import { IFindByStatusCookToOrderRepository } from '#/domain/repositories/find-by-status-cook-to-order.repository';
import { ILogger } from '#/domain/services/logger.service';
import { TYPES } from '#/infrastructure/config/di/types';

@injectable()
export class ListCookToOrder implements IListCookToOrderUseCase {
    constructor(
        @inject(TYPES.Logger) private readonly logger: ILogger,
        @inject(TYPES.FindActiveCookToOrderRepository)
        private readonly findActiveCookToOrderRepository: IFindActiveCookToOrderRepository,
        @inject(TYPES.FindByStatusCookToOrderRepository)
        private readonly findByStatusCookToOrderRepository: IFindByStatusCookToOrderRepository,
    ) {}

    async execute(status?: CookToOrderStatus): Promise<CookToOrder[]> {
        try {
            this.logger.info('Listing cook to order', { status });

            let cookToOrders: CookToOrder[];

            if (status) {
                cookToOrders = await this.findByStatusCookToOrderRepository.execute(status);
                this.logger.info('Found cook to orders by status', { status, count: cookToOrders.length });
            } else {
                cookToOrders = await this.findActiveCookToOrderRepository.execute();
                this.logger.info('Found active cook to orders', { count: cookToOrders.length });
            }

            return cookToOrders;
        } catch (error) {
            this.logger.error('Error listing cook to order', error as Error, { status });
            throw error;
        }
    }
}
