import { marshall } from '@aws-sdk/util-dynamodb';
import { inject } from 'inversify';

import { InfrastructureError } from '#/domain/errors';
import { IPutCookToOrderRepository } from '#/domain/repositories/put-cook-to-order.repository';
import { ILogger } from '#/domain/services/logger.service';
import { TYPES } from '#/infrastructure/config/di/types';
import { env } from '#/infrastructure/config/env';
import { DynamoDBClientImplementation } from '#/infrastructure/services/aws-dynamo.service';

export class DynamoDbPutCookToOrderRepository implements IPutCookToOrderRepository {
    constructor(
        @inject(TYPES.Logger) private readonly logger: ILogger,
        @inject(TYPES.DynamoDBClient) private readonly dynamoDBClient: DynamoDBClientImplementation,
    ) {}

    async execute(request: any): Promise<void> {
        try {
            this.logger.info('Putting cook to order in DynamoDB', { request });
            const params = {
                TableName: env.AWS_DYNAMO_DB,
                Item: marshall(request, { convertClassInstanceToMap: true, removeUndefinedValues: true }),
            };
            await this.dynamoDBClient.put(params);
            this.logger.info('Successfully put cook to order in DynamoDB', { request });
        } catch (error) {
            this.logger.error('Error putting cook to order in DynamoDB', error as Error, { error });

            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new InfrastructureError(`Failed to put cook to order in DynamoDB: ${errorMessage}`);
        }
    }
}
