const axios = require('axios');
require('dotenv').config();

const testCreation = async () => {
    try {
        console.log('--- Testing Ticket Creation via API ---');

        // 1. Login to get token
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@fuelstation.com', // Using standard admin from seed
            password: 'adminpassword123'
        });

        const token = loginRes.data.token;
        console.log('Login successful.');

        // 2. Create ticket
        const ticketPayload = {
            fuelType: 'Petrol',
            totalAmount: '5000',
            paymentMethod: 'Cash',
            stationName: 'Test Station',
            pricePerGallon: 3500,
            quantity: (5000 / 3500).toFixed(3)
        };

        const createRes = await axios.post('http://localhost:5000/api/tickets', ticketPayload, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Ticket created successfully:', createRes.data.ticketId);
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

testCreation();
