const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function fixColumns() {
  try {
    console.log('Starting UUID to TEXT conversion...\n');

    // Drop foreign key constraints first
    console.log('1. Dropping foreign key constraints...');
    await sql`ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_user_id_users_id_fk;`;
    await sql`ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_user_id_users_id_fk;`;
    console.log('   ✅ Foreign key constraints dropped\n');

    // Convert users table
    console.log('2. Converting users table...');
    await sql`ALTER TABLE users ALTER COLUMN id TYPE TEXT USING id::TEXT;`;
    console.log('   ✅ users.id converted to TEXT\n');

    // Convert sessions table
    console.log('3. Converting sessions table...');
    await sql`ALTER TABLE sessions ALTER COLUMN id TYPE TEXT USING id::TEXT;`;
    await sql`ALTER TABLE sessions ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;`;
    console.log('   ✅ sessions columns converted to TEXT\n');

    // Convert accounts table
    console.log('4. Converting accounts table...');
    await sql`ALTER TABLE accounts ALTER COLUMN id TYPE TEXT USING id::TEXT;`;
    await sql`ALTER TABLE accounts ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;`;
    console.log('   ✅ accounts columns converted to TEXT\n');

    // Convert verifications table
    console.log('5. Converting verifications table...');
    await sql`ALTER TABLE verifications ALTER COLUMN id TYPE TEXT USING id::TEXT;`;
    console.log('   ✅ verifications.id converted to TEXT\n');

    // Recreate foreign key constraints
    console.log('6. Recreating foreign key constraints...');
    await sql`ALTER TABLE sessions ADD CONSTRAINT sessions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;`;
    await sql`ALTER TABLE accounts ADD CONSTRAINT accounts_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;`;
    console.log('   ✅ Foreign key constraints recreated\n');

    console.log('✅ All columns successfully converted to TEXT!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

fixColumns();
