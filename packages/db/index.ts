import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

// Use the singleton pattern to ensure we don't create multiple instances
const prisma: ReturnType<typeof prismaClientSingleton> = globalThis.prismaGlobal ?? prismaClientSingleton();

// Export the prisma instance for usage
export default prisma;

// Export PrismaClient for other parts of the app
export { PrismaClient };

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
