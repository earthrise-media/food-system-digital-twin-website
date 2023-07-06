const { loadEnvConfig } = require('@next/env')

// Load configuration from env files using Next.js
const projectDir = process.cwd()
loadEnvConfig(projectDir)

// Get database connection
const DATABASE_URL = process.env.DATABASE_URL

module.exports = {
  client: 'postgresql',
  connection: { 
    connectionString: DATABASE_URL, 
    ssl:  {rejectUnauthorized: false}
  },
  migrations: {
    tableName: 'knex_migrations',
  },
}
