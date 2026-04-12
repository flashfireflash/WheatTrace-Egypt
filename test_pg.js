const { Client } = require('pg');

async function test() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('Set DATABASE_URL before running this script.');
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Check tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Tables:', res.rows.map(r => r.table_name));

    // Guessing snake_case
    const auths = await client.query(`SELECT * FROM "authorities"`);
    console.log('Authorities:', auths.rows);

  } catch(e) {
    console.error(e.message);
  } finally {
    client.end();
  }
}

test();
