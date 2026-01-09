import { z } from 'zod';

const VALIDATION_MESSAGES = {
    QUANTITY_MUST_BE_POSITIVE: 'The quantity must be greater than zero',
    MINIMUM_PRODUCTS: 'At least one item is required in the order',
    INVALID_UUID: 'Invalid UUID format',
} as const;

export const cookToOrderCreateRequestSchema = z.object({
    orderId: z.string().uuid({ message: VALIDATION_MESSAGES.INVALID_UUID }),
    orderProducts: z
        .array(
            z.object({
                name: z.string(),
                quantity: z.number().min(1, { message: VALIDATION_MESSAGES.QUANTITY_MUST_BE_POSITIVE }),
            }),
        )
        .min(1, { message: VALIDATION_MESSAGES.MINIMUM_PRODUCTS }),
});

export const cookToOrderParamsRequestSchema = z.object({
    id: z.string().uuid({ message: VALIDATION_MESSAGES.INVALID_UUID }),
});

export const cookToOrderQueryRequestSchema = z.object({
    status: z.enum(['RECEIVED', 'IN_PROGRESS', 'DONE']).optional(),
});

export type CookToOrderCreateRequest = z.infer<typeof cookToOrderCreateRequestSchema>;
export type CookToOrderParamsRequest = z.infer<typeof cookToOrderParamsRequestSchema>;
export type CookToOrderQueryRequest = z.infer<typeof cookToOrderQueryRequestSchema>;
