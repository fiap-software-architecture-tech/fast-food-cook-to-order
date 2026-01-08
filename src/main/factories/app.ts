import fastifySwagger from '@fastify/swagger';
import fastify, { FastifyInstance } from 'fastify';
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

import { container } from '#/infrastructure/config/di/container';

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

    return app;
}
