const http = require('http');

async function checkDb() {
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
      console.log('Login Response:', body);
      try {
        const token = JSON.parse(body).token;
        if (token) {
          getAuthorities(token);
        }
      } catch(e) {}
    });
  });
  req.on('error', e => console.error(e));
  req.write(reqData);
  req.end();
}

function getAuthorities(token) {
  const req = http.request({
    hostname: 'localhost',
    port: 5036,
    path: '/api/authorities',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log('Authorities Response:', body);
    });
  });
  req.end();
}

checkDb();
