const http = require('http');

const baseUrl = new URL(process.env.WHEATTRACE_API_BASE_URL ?? 'http://localhost:5036');
const username = process.env.WHEATTRACE_USERNAME;
const password = process.env.WHEATTRACE_PASSWORD;

if (!username || !password) {
  throw new Error('Set WHEATTRACE_USERNAME and WHEATTRACE_PASSWORD before running this script.');
}

const req = http.request({
  hostname: baseUrl.hostname,
  port: baseUrl.port,
  path: '/api/auth/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    try {
      const token = JSON.parse(body).token;
      http.get('http://localhost:5036/api/users/system-for-admin', {
        headers: { 'Authorization': 'Bearer ' + token }
      }, r2 => {
        let b2 = '';
        r2.on('data', d => b2 += d);
        r2.on('end', () => console.log(b2));
      });
    } catch(e) {
      console.log('Login failed:', body);
    }
  });
});

req.write(JSON.stringify({ username, password }));
req.end();
