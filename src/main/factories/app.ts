import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastify, { FastifyInstance } from 'fastify';
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

import { container } from '#/infrastructure/config/di/container';
import { errorHandler } from '#/interfaces/http/middlewares/error-handler';
import { cookToOrderRoute } from '#/interfaces/http/routes/cook-to-order.route';

export async function createApp(): Promise<FastifyInstance> {
    const app = fastify({ logger: true });

    app.decorate('container', container);

    app.setSerializerCompiler(serializerCompiler);
    app.setValidatorCompiler(validatorCompiler);

    app.register(fastifySwagger, {
        openapi: {
            info: {
                title: 'API FastFood Cook to Order',
                description: 'Documentação da API FastFood Cook to Order',
                version: '1.0.0',
            },
            tags: [
                {
                    name: 'Produção',
                    description: 'Operações relacionadas a produção',
                },
            ],
        },
        transform: jsonSchemaTransform,
    });

    app.register(fastifySwaggerUi, {
        routePrefix: '/docs',
    });

    app.register(cookToOrderRoute, { prefix: '/cook-to-order' });

    app.setErrorHandler(errorHandler);

    return app;
}
