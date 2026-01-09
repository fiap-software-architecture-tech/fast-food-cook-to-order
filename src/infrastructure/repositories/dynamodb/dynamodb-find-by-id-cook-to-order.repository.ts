import { marshall } from '@aws-sdk/util-dynamodb';
import { inject, injectable } from 'inversify';

import { CookToOrder } from '#/domain/entities/cook-to-order.entity';
import { InfrastructureError } from '#/domain/errors';
import { CookToOrderDynamoDTO } from '#/domain/repositories/dto/cook-to-order-dynamo.dto';
import { IFindByIdCookToOrderRepository } from '#/domain/repositories/find-by-id-cook-to-order.repository';
import { ILogger } from '#/domain/services/logger.service';
import { TYPES } from '#/infrastructure/config/di/types';
import { env } from '#/infrastructure/config/env';
import { CookToOrderMapper } from '#/infrastructure/repositories/dynamodb/mappers/cook-to-order.mapper';
import { DynamoDBClientImplementation } from '#/infrastructure/services/aws-dynamo.service';

@injectable()
export class DynamoDbFindByIdCookToOrderRepository implements IFindByIdCookToOrderRepository {
    constructor(
        @inject(TYPES.Logger) private readonly logger: ILogger,
        @inject(TYPES.DynamoDBClient) private readonly dynamoDBClient: DynamoDBClientImplementation,
    ) {}

    async execute(id: string): Promise<CookToOrder | null> {
        try {
            this.logger.info('Finding by id cook to order in DynamoDB', { id });
            const params = {
                TableName: env.AWS_DYNAMO_DB,
                Key: marshall({ pk: 'COOK_ORDER', orderId: id }, { convertClassInstanceToMap: true }),
            };

            const result = await this.dynamoDBClient.get<CookToOrderDynamoDTO>(params);

            if (!result) {
                this.logger.info('Cook to order not found', { id });
                return null;
            }

            this.logger.info('Successfully found cook to order in DynamoDB', { id });
            return CookToOrderMapper.toDomain(result);
        } catch (error) {
            this.logger.error('Error finding cook to order in DynamoDB', error as Error, { error });

            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new InfrastructureError(`Failed to find cook to order in DynamoDB: ${errorMessage}`);
        }
    }
}
