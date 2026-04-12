const http = require('http');

const baseUrl = new URL(process.env.WHEATTRACE_API_BASE_URL ?? 'http://localhost:5036');
const username = process.env.WHEATTRACE_USERNAME;
const password = process.env.WHEATTRACE_PASSWORD;

if (!username || !password) {
  throw new Error('Set WHEATTRACE_USERNAME and WHEATTRACE_PASSWORD before running this script.');
}

async function checkUsers() {
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
      try {
        const token = JSON.parse(body).token;
        if (token) {
          getUsers(token);
        }
      } catch(e) {}
    });
  });
  req.on('error', e => console.error(e));
  req.write(reqData);
  req.end();
}

function getUsers(token) {
  const req = http.request({
    hostname: baseUrl.hostname,
    port: baseUrl.port,
    path: '/api/users',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log('Users Response:', JSON.parse(body));
    });
  });
  req.end();
}

checkUsers();
