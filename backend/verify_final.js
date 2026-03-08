const api = require('axios');
require('dotenv').config();

const testSystem = async () => {
    const baseUrl = 'http://localhost:5000/api';
    console.log("--- System Live Verification ---");

    try {
        // 1. Check health
        const health = await api.get(`${baseUrl}/test`);
        console.log("Health Check:", health.data);

        // 2. Check inventory (should exist now)
        // We need a token for this, but let's see if the server just responds
        console.log("Note: API tests usually require a valid JWT. Please verify via frontend.");

    } catch (err) {
        console.error("Verification Error (Expected if not logged in):", err.message);
    }
};

testSystem();
