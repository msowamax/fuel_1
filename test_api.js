const axios = require('axios');

async function testApi() {
    console.log('--- Testing Backend API ---');
    try {
        // Try to access stats (anonymously first to see if it even reaches the route)
        const response = await axios.get('http://127.0.0.1:5000/api/tickets/stats').catch(e => e.response);

        if (response) {
            console.log(`Status: ${response.status}`);
            console.log('Data:', response.data);
        } else {
            console.log('No response from backend (Connection Refused?)');
        }

    } catch (err) {
        console.error('Test failed:', err.message);
    }
}

testApi();
