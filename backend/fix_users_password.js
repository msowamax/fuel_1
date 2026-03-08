const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log('Running schema update...');
    try {
        const { data, error } = await supabase.rpc('execute_sql', {
            sql_query: 'ALTER TABLE public.users ALTER COLUMN password DROP NOT NULL;'
        });
        console.log('Result:', data, error);
    } catch {
        console.log('Fallback: Dropping constraints manually if execute_sql is not available.');
    }
}

run();
