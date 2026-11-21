const { PrismaClient } = require('@prisma/client');

// Una sola instancia de Prisma para toda la API (evita abrir conexiones de más)
const prisma = new PrismaClient();

module.exports = prisma;
