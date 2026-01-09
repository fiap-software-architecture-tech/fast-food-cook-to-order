import { z } from 'zod';

import { badRequestSchema, notFoundSchema } from '#/interfaces/http/schemas/common/error.schema';
import {
    cookToOrderParamsRequestSchema,
    cookToOrderCreateRequestSchema,
    cookToOrderQueryRequestSchema,
} from '#/interfaces/http/schemas/cook-to-order/cook-to-order-request.schema';
import { cookToOrderResponseSchema } from '#/interfaces/http/schemas/cook-to-order/cook-to-order-response.schema';

export const cookToOrderCreateSchema = {
    schema: {
        tags: ['Produção'],
        summary: 'Cria pedido para cozinha',
        body: cookToOrderCreateRequestSchema,
        response: {
            201: z.void(),
            400: badRequestSchema,
        },
    },
};

export const cookToOrderStartSchema = {
    schema: {
        tags: ['Produção'],
        summary: 'Inicia preparo na cozinha',
        params: cookToOrderParamsRequestSchema,
        response: {
            200: z.void(),
            404: notFoundSchema,
        },
    },
};

export const cookToOrderReadySchema = {
    schema: {
        tags: ['Produção'],
        summary: 'Finaliza preparo na cozinha',
        params: cookToOrderParamsRequestSchema,
        response: {
            200: z.void(),
            404: notFoundSchema,
        },
    },
};

export const cookToOrderListSchema = {
    schema: {
        tags: ['Produção'],
        summary: 'Lista pedidos na fila de preparo',
        query: cookToOrderQueryRequestSchema,
        response: {
            200: z.array(cookToOrderResponseSchema),
        },
    },
};
