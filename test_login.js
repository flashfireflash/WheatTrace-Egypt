const http = require('http');

const baseUrl = new URL(process.env.WHEATTRACE_API_BASE_URL ?? 'http://localhost:5036');
const username = process.env.WHEATTRACE_USERNAME;
const password = process.env.WHEATTRACE_PASSWORD;

if (!username || !password) {
  throw new Error('Set WHEATTRACE_USERNAME and WHEATTRACE_PASSWORD before running this script.');
}

const reqData = JSON.stringify({
  username,
  password
});

const req = http.request({
  hostname: baseUrl.hostname,
  port: baseUrl.port,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(reqData)
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log(res.statusCode, 'Login Response:', body);
  });
});
req.on('error', e => console.error(e));
req.write(reqData);
req.end();
