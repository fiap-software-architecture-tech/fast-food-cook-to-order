import {
    DynamoDBClient,
    DynamoDBClientConfig,
    GetItemCommand,
    GetItemCommandInput,
    PutItemCommand,
    PutItemCommandInput,
    QueryCommand,
    QueryCommandInput,
    UpdateItemCommand,
    UpdateItemCommandInput,
} from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { injectable } from 'inversify';

import { env } from '#/infrastructure/config/env';

@injectable()
export class DynamoDBClientImplementation {
    private dynamoDB: DynamoDBClient;

    constructor() {
        const dynamoConfig: DynamoDBClientConfig = {
            region: env.AWS_REGION,
            maxAttempts: env.AWS_DYNAMO_MAX_RETRIES,
        };

        if (env.AWS_ENDPOINT_URL) {
            dynamoConfig.endpoint = env.AWS_ENDPOINT_URL;
        }

        this.dynamoDB = new DynamoDBClient(dynamoConfig);
    }

    public async get<T>(params: GetItemCommandInput): Promise<T | null> {
        const result = (await this.dynamoDB.send(new GetItemCommand(params))).Item;
        return result ? (unmarshall(result) as T) : null;
    }

    public async put(params: PutItemCommandInput): Promise<void> {
        await this.dynamoDB.send(new PutItemCommand(params));
    }

    public async query<T>(params: QueryCommandInput): Promise<T[]> {
        const result = await this.dynamoDB.send(new QueryCommand(params));
        return result.Items && result.Items.length > 0 ? result.Items.map(item => unmarshall(item) as T) : [];
    }

    public async update(params: UpdateItemCommandInput): Promise<void> {
        await this.dynamoDB.send(new UpdateItemCommand(params));
    }
}
