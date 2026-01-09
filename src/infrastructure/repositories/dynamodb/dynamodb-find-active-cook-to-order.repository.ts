import { marshall } from '@aws-sdk/util-dynamodb';
import { inject, injectable } from 'inversify';

import { CookToOrder } from '#/domain/entities/cook-to-order.entity';
import { InfrastructureError } from '#/domain/errors';
import { CookToOrderDynamoDTO } from '#/domain/repositories/dto/cook-to-order-dynamo.dto';
import { IFindActiveCookToOrderRepository } from '#/domain/repositories/find-active-cook-to-order.repository';
import { ILogger } from '#/domain/services/logger.service';
import { TYPES } from '#/infrastructure/config/di/types';
import { env } from '#/infrastructure/config/env';
import { CookToOrderMapper } from '#/infrastructure/repositories/dynamodb/mappers/cook-to-order.mapper';
import { DynamoDBClientImplementation } from '#/infrastructure/services/aws-dynamo.service';

@injectable()
export class DynamoDbFindActiveCookToOrderRepository implements IFindActiveCookToOrderRepository {
    constructor(
        @inject(TYPES.Logger) private readonly logger: ILogger,
        @inject(TYPES.DynamoDBClient) private readonly dynamoDBClient: DynamoDBClientImplementation,
    ) {}

    async execute(): Promise<CookToOrder[]> {
        try {
            this.logger.info('Finding active cook to order in DynamoDB');
            const params = {
                TableName: env.AWS_DYNAMO_DB,
                IndexName: 'queueStatus_createdAt_idx',
                KeyConditionExpression: 'queueStatus = :status',
                ExpressionAttributeValues: marshall({
                    ':status': 'ACTIVE',
                }),
            };

            const result = await this.dynamoDBClient.query<CookToOrderDynamoDTO>(params);

            if (!result || result.length === 0) {
                this.logger.info('No active cook to orders found');
                return [];
            }

            this.logger.info('Active cook to orders found', { count: result.length });

            return result.map(item => CookToOrderMapper.toDomain(item));
        } catch (error) {
            this.logger.error('Error finding cook to order in DynamoDB', error as Error, { error });

            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new InfrastructureError(`Failed to find cook to order in DynamoDB: ${errorMessage}`);
        }
    }
}
