const axios = require('axios');

async function testLogin() {
    try {
        const payload = {
            email: 'msowa.3.2004@gmail.com',
            password: 'password123'
        };
        console.log('Sending login payload:', payload);
        const response = await axios.post('http://localhost:5000/api/auth/login', payload);
        console.log('Response Status:', response.status);
        console.log('Response Data:', response.data);
    } catch (error) {
        console.error('Login Failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error Message:', error.message);
        }
    }
}

testLogin();
