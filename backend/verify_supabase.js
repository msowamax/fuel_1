const axios = require('axios');

const testSupabase = async () => {
    const email = `supabase_test_${Date.now()}@example.com`;
    const password = 'password123';

    try {
        console.log('--- Testing Signup ---');
        const signupRes = await axios.post('http://localhost:5000/api/auth/signup', {
            name: 'Supabase User',
            email,
            password,
            stationName: 'Supabase Station',
            role: 'admin'
        });
        console.log('Signup success:', signupRes.data.user.email);
        console.log('StationName mapped:', signupRes.data.user.stationName);

        console.log('\n--- Testing Login ---');
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email,
            password
        });
        console.log('Login success:', loginRes.data.user.email);
        console.log('Token received:', loginRes.data.token.substring(0, 20) + '...');

        process.exit(0);
    } catch (error) {
        console.error('Test Failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Message:', error.message);
        }
        process.exit(1);
    }
};

testSupabase();
