const { Client } = require('pg');

async function test() {
  const client = new Client({
    connectionString: "postgres://postgres.ryjhvbnosdkcledhsxwm:Nfsa$$08042026@aws-1-eu-central-1.pooler.supabase.com:5432/postgres",
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
