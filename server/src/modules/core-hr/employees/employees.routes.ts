
// server/src/modules/core-hr/employees/employees.routes.ts
import { FastifyInstance } from 'fastify';
import { employees, Employee } from './employees.dummy';
import { randomUUID } from 'crypto';

export async function employeeRoutes(fastify: FastifyInstance) {
    fastify.get('/', async (request, reply) => {
        return employees;
    });

    fastify.get('/:id', async (request: any, reply) => {
        const employee = employees.find(e => e.id === request.params.id);
        if (!employee) {
            return reply.code(404).send({ error: 'Employee not found' });
        }
        return employee;
    });

    fastify.post('/', async (request: any, reply) => {
        const newEmployee = request.body as Employee;
        const employeeWithId = { ...newEmployee, id: `EMP${Math.floor(Math.random() * 1000)}` }; // Simple ID gen
        employees.push(employeeWithId);
        return reply.code(201).send(employeeWithId);
    });

    fastify.patch('/:id/status', async (request: any, reply) => {
        const { id } = request.params;
        const { status } = request.body as { status: 'Active' | 'Inactive' };
        const employee = employees.find(e => e.id === id);

        if (!employee) {
            return reply.code(404).send({ error: 'Employee not found' });
        }

        employee.status = status;
        return employee;
    });
}
