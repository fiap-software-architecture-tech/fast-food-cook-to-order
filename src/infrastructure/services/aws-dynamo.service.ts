import {
    DynamoDBClient,
    DynamoDBClientConfig,
    GetItemCommand,
    GetItemCommandInput,
    ItemResponse,
    PutItemCommand,
    PutItemCommandInput,
    QueryCommand,
    QueryCommandInput,
} from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

import { env } from '#/infrastructure/config/env';

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

    public async put(params: PutItemCommandInput): Promise<void> {
        await this.dynamoDB.send(new PutItemCommand(params));
    }

    public async get(params: GetItemCommandInput): Promise<ItemResponse | undefined> {
        const result = (await this.dynamoDB.send(new GetItemCommand(params))).Item;
        return result ? unmarshall(result) : undefined;
    }

    public async query(params: QueryCommandInput): Promise<any[]> {
        const result = await this.dynamoDB.send(new QueryCommand(params));
        return result.Items && result.Items.length > 0 ? result.Items.map(item => unmarshall(item)) : [];
    }
}
