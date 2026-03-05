
// server/src/server.ts
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { employeeRoutes } from './modules/core-hr/employees/employees.routes';
import { departmentRoutes } from './modules/core-hr/departments/departments.routes';
import { designationRoutes } from './modules/core-hr/designations/designations.routes';
import { orgChartRoutes } from './modules/core-hr/org-chart/orgChart.routes';
import { lifecycleRoutes } from './modules/core-hr/lifecycle/lifecycle.routes';
import { accessRoutes } from './modules/core-hr/access/access.routes';
import { customFieldsRoutes } from './modules/core-hr/custom-fields/customFields.routes';
import { settingsRoutes } from './modules/core-hr/settings/settings.routes';

const server = Fastify({
    logger: true
});

server.register(cors, {
    origin: '*', // Allow all origins for dev
});

// Health check
server.get('/health', async (request, reply) => {
    return { status: 'ok' };
});

// Register Routes
server.register(employeeRoutes, { prefix: '/api/employees' });
server.register(departmentRoutes, { prefix: '/api/departments' });
server.register(designationRoutes, { prefix: '/api/designations' });
server.register(orgChartRoutes, { prefix: '/api/org-chart' });
server.register(lifecycleRoutes, { prefix: '/api/lifecycle' });
// Access routes has /roles inside it, so prefix should be /api or access
// Requirement says GET /api/roles. So I'll mount access routes at /api
server.register(accessRoutes, { prefix: '/api' });
server.register(customFieldsRoutes, { prefix: '/api/custom-fields' });
server.register(settingsRoutes, { prefix: '/api/settings' });

const start = async () => {
    try {
        await server.listen({ port: 3001, host: '0.0.0.0' });
        console.log('Server running at http://localhost:3001');
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
