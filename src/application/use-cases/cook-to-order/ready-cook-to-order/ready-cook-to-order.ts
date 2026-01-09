import { inject, injectable } from 'inversify';

import { IReadyCookToOrderUseCase } from '#/application/use-cases/cook-to-order/ready-cook-to-order/ready-cook-to-order.use-case';
import { CookToOrderStatus } from '#/domain/enum/cook-to-order-status';
import { NotFoundError } from '#/domain/errors';
import { IUpdateOrderStatus } from '#/domain/gateways/order/update-order-status';
import { IFindByIdCookToOrderRepository } from '#/domain/repositories/find-by-id-cook-to-order.repository';
import { IUpdateCookToOrderRepository } from '#/domain/repositories/update-cook-to-order.repository';
import { ILogger } from '#/domain/services/logger.service';
import { TYPES } from '#/infrastructure/config/di/types';
import { CookToOrderMapper } from '#/infrastructure/repositories/dynamodb/mappers/cook-to-order.mapper';

@injectable()
export class ReadyCookToOrder implements IReadyCookToOrderUseCase {
    constructor(
        @inject(TYPES.Logger) private readonly logger: ILogger,
        @inject(TYPES.FindByIdCookToOrderRepository)
        private readonly findCookToOrderByIdRepository: IFindByIdCookToOrderRepository,
        @inject(TYPES.UpdateCookToOrderRepository)
        private readonly updateCookToOrderRepository: IUpdateCookToOrderRepository,
        @inject(TYPES.UpdateOrderStatusGateway)
        private readonly updateOrderStatus: IUpdateOrderStatus,
    ) {}

    async execute(id: string): Promise<void> {
        try {
            this.logger.info('Marking cook to order as ready', { id });

            const cookToOrder = await this.findCookToOrderByIdRepository.execute(id);
            if (!cookToOrder) {
                this.logger.warn('Cook to order not found', { id });
                throw new NotFoundError(`Cook to order not found with id: ${id}`);
            }

            cookToOrder.ready();

            const dynamoData = CookToOrderMapper.toDynamoDB(cookToOrder);
            await this.updateCookToOrderRepository.execute(dynamoData);

            await this.updateOrderStatus.execute({
                orderId: cookToOrder.orderId,
                status: CookToOrderStatus.DONE,
            });

            this.logger.info('Cook to order marked as ready', { id });
        } catch (error) {
            this.logger.error('Error marking cook to order as ready', error as Error, { id });
            throw error;
        }
    }
}
