import z from 'zod';

export const cookToOrderResponseSchema = z.object({
    orderId: z.string().uuid(),
    items: z.array(
        z.object({
            name: z.string(),
            quantity: z.number(),
        }),
    ),
    status: z.string(),
    createdAt: z.string(),
});

export type CookToOrderResponse = z.infer<typeof cookToOrderResponseSchema>;
