import { marshall } from '@aws-sdk/util-dynamodb';
import { inject, injectable } from 'inversify';

import { CookToOrderStatus } from '#/domain/enum/cook-to-order-status';
import { InfrastructureError } from '#/domain/errors';
import { CookToOrderDynamoDTO } from '#/domain/repositories/dto/cook-to-order-dynamo.dto';
import { IUpdateCookToOrderRepository } from '#/domain/repositories/update-cook-to-order.repository';
import { ILogger } from '#/domain/services/logger.service';
import { TYPES } from '#/infrastructure/config/di/types';
import { env } from '#/infrastructure/config/env';
import { DynamoDBClientImplementation } from '#/infrastructure/services/aws-dynamo.service';

@injectable()
export class DynamoDbUpdateCookToOrderRepository implements IUpdateCookToOrderRepository {
    constructor(
        @inject(TYPES.Logger) private readonly logger: ILogger,
        @inject(TYPES.DynamoDBClient) private readonly dynamoDBClient: DynamoDBClientImplementation,
    ) {}

    async execute(request: CookToOrderDynamoDTO): Promise<void> {
        try {
            this.logger.info('Updating cook to order in DynamoDB', { request });
            const params = {
                TableName: env.AWS_DYNAMO_DB,
                Key: marshall({
                    pk: request.pk,
                    sk: request.sk,
                }),
                UpdateExpression: 'SET #status = :status, queueStatus = :queueStatus, updatedAt = :updatedAt',
                ConditionExpression: '#status <> :status',
                ExpressionAttributeNames: {
                    '#status': 'status',
                },
                ExpressionAttributeValues: marshall({
                    ':status': request.status,
                    ':queueStatus': request.status === CookToOrderStatus.READY ? 'DONE' : 'ACTIVE',
                    ':updatedAt': request.updatedAt,
                }),
            };
            await this.dynamoDBClient.update(params);
            this.logger.info('Successfully updated cook to order in DynamoDB', { request });
        } catch (error) {
            this.logger.error('Error updating cook to order in DynamoDB', error as Error, { error });

            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new InfrastructureError(`Failed to update cook to order in DynamoDB: ${errorMessage}`);
        }
    }
}
