const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('Set DATABASE_URL before running this script.');
}

const pool = new Pool({
  connectionString
});

async function run() {
  const res = await pool.query('SELECT username, role, name FROM users');
  console.log(res.rows);
  pool.end();
}
run();
