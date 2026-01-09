import { FastifyInstance } from 'fastify';
import { StatusCodes } from 'http-status-codes';

import { CookToOrderStatus } from '#/domain/enum/cook-to-order-status';
import { TYPES } from '#/infrastructure/config/di/types';
import { CookToOrderController } from '#/interfaces/controller/cook-to-order.controller';
import {
    CookToOrderCreateRequest,
    CookToOrderParamsRequest,
    CookToOrderQueryRequest,
} from '#/interfaces/http/schemas/cook-to-order/cook-to-order-request.schema';
import {
    cookToOrderCreateSchema,
    cookToOrderListSchema,
    cookToOrderReadySchema,
    cookToOrderStartSchema,
} from '#/interfaces/http/schemas/cook-to-order/cook-to-order.route-schema';

export const cookToOrderRoute = (app: FastifyInstance) => {
    const controller = app.container.get<CookToOrderController>(TYPES.CookToOrderController);

    app.post<{ Body: CookToOrderCreateRequest }>('/', cookToOrderCreateSchema, async (req, reply) => {
        await controller.create(req.body);
        return reply.status(StatusCodes.CREATED).send();
    });

    app.get<{ Querystring: CookToOrderQueryRequest }>('/queue', cookToOrderListSchema, async (req, reply) => {
        const response = await controller.list(req.query.status as CookToOrderStatus | undefined);
        return reply.send(response);
    });

    app.put<{ Params: CookToOrderParamsRequest }>('/:id/start', cookToOrderStartSchema, async (req, reply) => {
        await controller.startCookToOrder(req.params.id);
        return reply.status(StatusCodes.NO_CONTENT).send();
    });

    app.put<{ Params: CookToOrderParamsRequest }>('/:id/ready', cookToOrderReadySchema, async (req, reply) => {
        await controller.readyCookToOrder(req.params.id);
        return reply.status(StatusCodes.NO_CONTENT).send();
    });
};
