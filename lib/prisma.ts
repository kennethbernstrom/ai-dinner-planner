import { PrismaClient } from '@prisma/client';
import Constants from 'expo-constants';

// Get DATABASE_URL from environment or expo config
const DATABASE_URL = process.env.DATABASE_URL || Constants.expoConfig?.extra?.databaseUrl;

if (!DATABASE_URL) {
  console.warn('DATABASE_URL is not set. Please add it to your .env file or app.config.js');
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
