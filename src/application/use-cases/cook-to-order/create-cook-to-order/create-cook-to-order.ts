import { inject, injectable } from 'inversify';

import { ICreateCookToOrderUseCase } from '#/application/use-cases/cook-to-order/create-cook-to-order/create-cook-to-order.use-case';
import { CookToOrder } from '#/domain/entities/cook-to-order.entity';
import { CookToOrderStatus } from '#/domain/enum/cook-to-order-status';
import { IUpdateOrderStatus } from '#/domain/gateways/order/update-order-status';
import { IPutCookToOrderRepository } from '#/domain/repositories/put-cook-to-order.repository';
import { ILogger } from '#/domain/services/logger.service';
import { TYPES } from '#/infrastructure/config/di/types';
import { CookToOrderMapper } from '#/infrastructure/repositories/dynamodb/mappers/cook-to-order.mapper';
import { CookToOrderCreateRequest } from '#/interfaces/http/schemas/cook-to-order/cook-to-order-request.schema';

@injectable()
export class CreateCookToOrder implements ICreateCookToOrderUseCase {
    constructor(
        @inject(TYPES.Logger) private readonly logger: ILogger,
        @inject(TYPES.PutCookToOrderRepository) private readonly putCookToOrderRepository: IPutCookToOrderRepository,
        @inject(TYPES.UpdateOrderStatusGateway) private readonly updateOrderStatusGateway: IUpdateOrderStatus,
    ) {}

    async execute(request: CookToOrderCreateRequest): Promise<void> {
        try {
            this.logger.info('Creating cook to order', { orderId: request.orderId });

            const now = new Date().toISOString();
            const cookToOrder = new CookToOrder({
                orderId: request.orderId,
                items: request.orderProducts.map(product => ({
                    name: product.name,
                    quantity: product.quantity,
                })),
                status: CookToOrderStatus.RECEIVED,
                createdAt: now,
                updatedAt: now,
            });

            const dynamoData = CookToOrderMapper.toDynamoDB(cookToOrder);
            await this.putCookToOrderRepository.execute(dynamoData);
            this.logger.info('Cook to order created successfully', { orderId: request.orderId });

            await this.updateOrderStatusGateway.execute({
                orderId: request.orderId,
                status: CookToOrderStatus.RECEIVED,
            });
            this.logger.info('Order status updated to RECEIVED', { orderId: request.orderId });
        } catch (error) {
            this.logger.error('Error creating cook to order', error as Error, { orderId: request.orderId });
            throw error;
        }
    }
}
