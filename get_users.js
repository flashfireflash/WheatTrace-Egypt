const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 5036,
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

req.write(JSON.stringify({ username: 'admin', password: 'admin123' }));
req.end();
