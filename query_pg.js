const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('Set DATABASE_URL before running this script.');
}

const client = new Client({
  connectionString
});
client.connect().then(() => {
  client.query('SELECT username, role FROM public.users LIMIT 10').then(res => {
    console.log(res.rows);
    client.end();
  }).catch(e => console.log(e));
}).catch(e => console.log(e));
