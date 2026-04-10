const http = require('http');

async function testMessages() {
  const reqData = JSON.stringify({
    username: "admin",
    password: "admin123"
  });

  const req = http.request({
    hostname: 'localhost',
    port: 5036,
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
    inspectorId: "0e398363-ae7c-4053-8bbb-a844f58ff1b1", // inspector1
    message: "Test message"
  });

  const req = http.request({
    hostname: 'localhost',
    port: 5036,
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
