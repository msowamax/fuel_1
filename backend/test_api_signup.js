const fetch = require('node-fetch');

async function testSignupAPI() {
    console.log('Testing /api/auth/signup endpoint directly...');
    const res = await fetch('http://127.0.0.1:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'API Test',
            email: 'api_test_' + Date.now() + '@example.com',
            password: 'securePassword123!',
            stationName: 'TestStation',
            role: 'employee'
        })
    });

    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', data);
}

testSignupAPI();
