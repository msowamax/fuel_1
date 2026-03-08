const http = require('http');

const data = JSON.stringify({
    name: 'API Test',
    email: 'api_test_' + Date.now() + '@example.com',
    password: 'securePassword123!',
    stationName: 'TestStation',
    role: 'employee'
});

const options = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/signup',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
};

const req = http.request(options, res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => console.log('Status:', res.statusCode, 'Body:', body));
});

req.on('error', e => console.error(`Problem with request: ${e.message}`));
req.write(data);
req.end();
