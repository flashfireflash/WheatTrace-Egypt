const http = require('http');

async function checkUsers() {
  const reqData = JSON.stringify({
    username: "admin",
    password: "admin123"
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
    hostname: 'localhost',
    port: 5036,
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
