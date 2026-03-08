const supabase = require('./supabase');
const fs = require('fs');

async function debug() {
    console.log('--- Debugging User & Logs ---');
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('*');

        if (error) {
            console.error('Error fetching users:', error);
        } else {
            console.log('Users in DB:');
            users.forEach(u => {
                console.log(`ID: ${u.id}, Name: ${u.name}, Role: ${u.role}, Station: ${u.station_name}`);
            });
        }

        console.log('\n--- Recent Server Logs ---');
        if (fs.existsSync('server_log.txt')) {
            const logs = fs.readFileSync('server_log.txt', 'utf8').split('\n').slice(-20).join('\n');
            console.log(logs);
        } else {
            console.log('server_log.txt not found');
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

debug();
