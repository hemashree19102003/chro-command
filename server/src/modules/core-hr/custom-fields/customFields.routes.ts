
// server/src/modules/core-hr/custom-fields/customFields.routes.ts
import { FastifyInstance } from 'fastify';

const customFields = [
    { id: 1, name: "Blood Group", type: "text", required: true },
    { id: 2, name: "Emergency Contact", type: "number", required: true },
];

export async function customFieldsRoutes(fastify: FastifyInstance) {
    fastify.get('/', async (request, reply) => {
        return customFields;
    });

    fastify.post('/', async (request: any, reply) => {
        const field = request.body;
        const newField = { ...field, id: customFields.length + 1 };
        customFields.push(newField);
        return reply.code(201).send(newField);
    });
}
