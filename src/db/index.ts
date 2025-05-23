import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const client = postgres({
  host: 'localhost',
  port: 5432,
  database: 'final-project',
  username: 'postgres',
  password: 'Hooyo100'
});

export const db = drizzle(client, { schema });
