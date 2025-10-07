
require('dotenv').config()

const db_url = process.env.DATABASE_URL;
console.log("DB URL: ", db_url);

export default {
  schema: './src/db/prisma/schema.prisma',
};