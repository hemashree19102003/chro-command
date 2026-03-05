
// server/src/modules/core-hr/designations/designations.routes.ts
import { FastifyInstance } from 'fastify';
import { designations } from './designations.dummy';

export async function designationRoutes(fastify: FastifyInstance) {
    fastify.get('/', async (request, reply) => {
        return designations;
    });

    fastify.post('/', async (request: any, reply) => {
        const { name, department, level } = request.body;
        const newDesig = { id: String(designations.length + 1), name, department, level };
        designations.push(newDesig);
        return reply.code(201).send(newDesig);
    });
}
