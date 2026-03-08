const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function diag() {
    console.log('--- Diagnosing Anon/Restricted Access ---');
    const { data, error } = await supabase.from('users').select('id, email').limit(1);

    if (error) {
        console.error('RLS Blocked Access as expected:', error.message);
    } else {
        console.log('Access allowed. Count:', data.length);
        if (data.length === 0) {
            console.log('Table is empty or RLS is filtering all rows.');
        }
    }
}

diag();
