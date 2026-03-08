const supabase = require('./supabase');
require('dotenv').config();

const probeUsers = async () => {
    try {
        // Attempt to insert with a random UUID to see if it works
        const testId = '00000000-0000-0000-0000-000000000000';
        const { error } = await supabase.from('users').insert({
            id: testId,
            name: 'Probe',
            email: 'probe@test.com',
            password: 'pwd',
            station_name: 'Test'
        });

        if (error) {
            console.log('Error Code:', error.code);
            console.log('Error Message:', error.message);
        } else {
            console.log('Insert with explicit ID worked.');
            await supabase.from('users').delete().eq('id', testId);
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

probeUsers();
