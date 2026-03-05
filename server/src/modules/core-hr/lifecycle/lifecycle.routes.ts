
// server/src/modules/core-hr/lifecycle/lifecycle.routes.ts
import { FastifyInstance } from 'fastify';

const lifecycleEvents = [
    { id: 1, employeeId: "EMP001", type: "Onboarding", date: "2024-01-12", status: "Completed" },
    { id: 2, employeeId: "EMP002", type: "Onboarding", date: "2024-02-15", status: "Completed" },
];

export async function lifecycleRoutes(fastify: FastifyInstance) {
    fastify.get('/', async (request, reply) => {
        return lifecycleEvents;
    });

    fastify.post('/', async (request: any, reply) => {
        const event = request.body;
        lifecycleEvents.push({ ...event, id: lifecycleEvents.length + 1 });
        return reply.code(201).send(event);
    });
}
