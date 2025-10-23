import { db } from '../db/db';

beforeAll(async () => {
  // Conectar a base de datos de test
  console.log('Conectando a DB de test...');
});

afterAll(async () => {
  await db.$disconnect();
});