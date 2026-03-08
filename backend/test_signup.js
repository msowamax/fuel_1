const axios = require('axios');

const testSignup = async () => {
    try {
        const payload = {
            name: 'Test User',
            email: `test_${Date.now()}@example.com`,
            password: 'password123',
            stationName: 'Test Station',
            role: 'employee'
        };
        console.log('Sending payload:', payload);
        const response = await axios.post('http://localhost:5000/api/auth/signup', payload);
        console.log('Response Status:', response.status);
        console.log('Response Data:', response.data);
    } catch (error) {
        console.error('Signup Failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error Message:', error.message);
        }
    }
};

testSignup();
