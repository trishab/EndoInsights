/** @type {import('drizzle-kit').Config} */
module.exports = {
  schema: './lib/schema.js',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
};
