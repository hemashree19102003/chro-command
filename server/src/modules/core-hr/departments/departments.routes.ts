
// server/src/modules/core-hr/departments/departments.routes.ts
import { FastifyInstance } from 'fastify';
import { departments } from './departments.dummy';

export async function departmentRoutes(fastify: FastifyInstance) {
    fastify.get('/', async (request, reply) => {
        return departments;
    });

    fastify.post('/', async (request: any, reply) => {
        const { name, head } = request.body;
        const newDept = { id: String(departments.length + 1), name, head };
        departments.push(newDept);
        return reply.code(201).send(newDept);
    });
}
