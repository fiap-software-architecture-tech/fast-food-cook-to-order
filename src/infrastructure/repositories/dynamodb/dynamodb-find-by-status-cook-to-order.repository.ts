import { marshall } from '@aws-sdk/util-dynamodb';
import { inject, injectable } from 'inversify';

import { CookToOrder } from '#/domain/entities/cook-to-order.entity';
import { CookToOrderStatus } from '#/domain/enum/cook-to-order-status';
import { InfrastructureError } from '#/domain/errors';
import { CookToOrderDynamoDTO } from '#/domain/repositories/dto/cook-to-order-dynamo.dto';
import { IFindByStatusCookToOrderRepository } from '#/domain/repositories/find-by-status-cook-to-order.repository';
import { ILogger } from '#/domain/services/logger.service';
import { TYPES } from '#/infrastructure/config/di/types';
import { env } from '#/infrastructure/config/env';
import { CookToOrderMapper } from '#/infrastructure/repositories/dynamodb/mappers/cook-to-order.mapper';
import { DynamoDBClientImplementation } from '#/infrastructure/services/aws-dynamo.service';

@injectable()
export class DynamoDbFindByStatusCookToOrderRepository implements IFindByStatusCookToOrderRepository {
    constructor(
        @inject(TYPES.Logger) private readonly logger: ILogger,
        @inject(TYPES.DynamoDBClient) private readonly dynamoDBClient: DynamoDBClientImplementation,
    ) {}

    async execute(status: CookToOrderStatus): Promise<CookToOrder[]> {
        try {
            this.logger.info('Finding by status cook to order in DynamoDB', { status });
            const params = {
                TableName: env.AWS_DYNAMO_DB,
                IndexName: 'status_createdAt_idx',
                KeyConditionExpression: '#status = :status',
                ExpressionAttributeNames: {
                    '#status': 'status',
                },
                ExpressionAttributeValues: marshall({
                    ':status': status,
                }),
            };

            const result = await this.dynamoDBClient.query<CookToOrderDynamoDTO>(params);

            if (!result || result.length === 0) {
                this.logger.info('No cook to orders found for status', { status });
                return [];
            }

            this.logger.info('Successfully found cook to order in DynamoDB', { status });
            return result.map(item => CookToOrderMapper.toDomain(item));
        } catch (error) {
            this.logger.error('Error finding cook to order in DynamoDB', error as Error, { error });

            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new InfrastructureError(`Failed to find cook to order in DynamoDB: ${errorMessage}`);
        }
    }
}
