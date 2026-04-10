const { Client } = require('pg');
const client = new Client({
  connectionString: 'Host=localhost;Database=postgres;Username=postgres;Password=postgres'
});
client.connect().then(() => {
  client.query("SELECT username, role, current_password_hash FROM public.\"users\" LIMIT 10").then(res => {
    console.log(res.rows);
    client.end();
  }).catch(e => console.log(e));
}).catch(e => console.log(e));
