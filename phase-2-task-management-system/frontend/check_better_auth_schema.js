const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkSchema() {
  try {
    const tables = ['users', 'sessions', 'accounts', 'verifications', 'jwks'];

    for (const table of tables) {
      console.log('\n=== ' + table.toUpperCase() + ' TABLE ===');
      const result = await sql`SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = 'public' AND table_name = ${table} ORDER BY ordinal_position;`;
      if (result.length === 0) {
        console.log('⚠️  Table does not exist!');
      } else {
        console.log(JSON.stringify(result, null, 2));
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkSchema();
