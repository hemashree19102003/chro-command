
// server/src/modules/core-hr/org-chart/orgChart.routes.ts
import { FastifyInstance } from 'fastify';

const orgChartData = {
    name: "CEO",
    children: [
        {
            name: "Engineering Head",
            children: [
                { name: "Team Lead 1", children: [{ name: "Dev 1" }, { name: "Dev 2" }] },
                { name: "Team Lead 2", children: [{ name: "Dev 3" }] }
            ]
        },
        {
            name: "HR Head",
            children: [{ name: "Recruiter 1" }, { name: "HR Manager" }]
        }
    ]
};

export async function orgChartRoutes(fastify: FastifyInstance) {
    fastify.get('/', async (request, reply) => {
        return orgChartData;
    });
}
