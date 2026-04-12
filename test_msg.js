const http = require('http');

const baseUrl = new URL(process.env.WHEATTRACE_API_BASE_URL ?? 'http://localhost:5036');
const username = process.env.WHEATTRACE_USERNAME;
const password = process.env.WHEATTRACE_PASSWORD;
const inspectorId = process.env.WHEATTRACE_INSPECTOR_ID;

if (!username || !password || !inspectorId) {
  throw new Error('Set WHEATTRACE_USERNAME, WHEATTRACE_PASSWORD, and WHEATTRACE_INSPECTOR_ID before running this script.');
}

async function testMessages() {
  const reqData = JSON.stringify({
    username,
    password
  });

  const req = http.request({
    hostname: baseUrl.hostname,
    port: baseUrl.port,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      try {
        const token = JSON.parse(body).token;
        sendMessage(token);
      } catch(e) {}
    });
  });
  req.write(reqData);
  req.end();
}

function sendMessage(token) {
  const payload = JSON.stringify({
    inspectorId,
    message: "Test message"
  });

  const req = http.request({
    hostname: baseUrl.hostname,
    port: baseUrl.port,
    path: '/api/messages',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log('SendMessage Status:', res.statusCode);
      console.log('SendMessage Response:', body);
    });
  });
  req.write(payload);
  req.end();
}

testMessages();
