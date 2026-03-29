import path from 'node:path';
import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    url: 'file:' + path.join(__dirname, 'prisma', 'dev.db'),
  },
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  migrations: {
    seed: 'npx tsx prisma/seed.ts',
  },
});
