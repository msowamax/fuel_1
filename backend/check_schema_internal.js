const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSchema() {
    console.log('--- Database Schema Check ---');
    try {
        const { data, error } = await supabase.from('fuel_tickets').select('*').limit(1);
        if (error) {
            console.error('Error fetching sample:', error.message);
            // If the error is about a missing column, we know what we need to fix
            return;
        }
        if (data && data.length > 0) {
            console.log('Valid Columns:', Object.keys(data[0]));
        } else {
            console.log('Table exists but is empty.');
            // Try to fetch column names from information_schema if permissions allow
            const { data: cols, error: colError } = await supabase.rpc('get_column_names', { table_name: 'fuel_tickets' });
            if (colError) {
                console.log('RPC check failed (expected if not defined). Error:', colError.message);
                // Last ditch: try to insert and see what fails
                const { error: insError } = await supabase.from('fuel_tickets').insert([{ non_existent_column_test: 1 }]);
                console.log('Hint from error message:', insError.message);
            } else {
                console.log('Columns via RPC:', cols);
            }
        }
    } catch (e) {
        console.error('System Error:', e.message);
    }
}

checkSchema();
