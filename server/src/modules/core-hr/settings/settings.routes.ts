
// server/src/modules/core-hr/settings/settings.routes.ts
import { FastifyInstance } from 'fastify';

let settings = {
    companyName: "CHRO Command",
    timezone: "Asia/Kolkata",
    dateFormat: "DD-MM-YYYY",
};

export async function settingsRoutes(fastify: FastifyInstance) {
    fastify.get('/', async (request, reply) => {
        return settings;
    });

    fastify.patch('/', async (request: any, reply) => {
        const updates = request.body;
        settings = { ...settings, ...updates };
        return settings;
    });
}
