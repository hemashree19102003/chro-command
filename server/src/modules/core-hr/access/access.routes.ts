
// server/src/modules/core-hr/access/access.routes.ts
import { FastifyInstance } from 'fastify';

const roles = [
    { id: 1, name: "Admin", permissions: ["all"] },
    { id: 2, name: "HR", permissions: ["read:employees", "write:employees"] },
    { id: 3, name: "Manager", permissions: ["read:team"] },
    { id: 4, name: "Employee", permissions: ["read:self"] },
];

export async function accessRoutes(fastify: FastifyInstance) {
    fastify.get('/roles', async (request, reply) => {
        return roles;
    });
}
