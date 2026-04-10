const http = require('http');

const reqData = JSON.stringify({
  username: "inspector",
  password: "inspector123"
});

const req = http.request({
  hostname: 'localhost',
  port: 5036,
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
