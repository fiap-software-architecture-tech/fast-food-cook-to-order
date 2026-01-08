import z from 'zod';

const envSchema = z.object({
    // Environment
    NODE_ENV: z.enum(['dev', 'hml', 'prd']).default('dev'),

    // Server
    PORT: z.coerce.number().default(3000),

    // AWS
    AWS_REGION: z.string(),
    AWS_ENDPOINT_URL: z.string().optional(),
    AWS_DYNAMO_DB: z.string(),
    AWS_DYNAMO_MAX_RETRIES: z.coerce.number().default(3),

    // API URL
    FAST_FOOD_ORDER_API_URL: z.string(),
});

export const env = envSchema.parse(process.env);
