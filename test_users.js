const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.ryovgrmjovvjtycbfnjf:Hazem2016@@aws-0-eu-central-1.pooler.supabase.com:6543/postgres'
});

async function run() {
  const res = await pool.query('SELECT username, "Role", "Name", "PasswordHash" FROM users');
  console.log(res.rows);
  pool.end();
}
run();
