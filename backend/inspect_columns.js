const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectTable() {
    console.log('--- Inspecting fuel_tickets Schema ---');
    try {
        // Try to query information_schema.columns
        // Note: This often requires the service role key or specific permissions
        const { data, error } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type')
            .eq('table_name', 'fuel_tickets');

        if (error) {
            console.log('Direct information_schema query failed:', error.message);
            console.log('Attempting trial-and-error insert to discover required columns...');

            // Try to insert an empty object to get a list of required columns in the error
            const { error: insError } = await supabase.from('fuel_tickets').insert([{}]);
            console.log('Insert Error Hint:', insError ? insError.message : 'No error? That is unexpected.');
        } else {
            console.log('Columns found:', data.map(c => `${c.column_name} (${c.data_type})`).join(', '));
        }
    } catch (e) {
        console.error('System Error:', e.message);
    }
}

inspectTable();
