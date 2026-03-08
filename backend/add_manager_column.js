const supabase = require('./supabase');
require('dotenv').config();

const updateSchemaManager = async () => {
    try {
        const { error } = await supabase.rpc('execute_sql', {
            sql_query: `ALTER TABLE fuel_tickets ADD COLUMN IF NOT EXISTS manager_name TEXT;`
        });

        if (error) {
            // Fallback if execute_sql is not available
            console.log('execute_sql RPC not found, please run this in Supabase SQL Editor:');
            console.log('ALTER TABLE fuel_tickets ADD COLUMN IF NOT EXISTS manager_name TEXT;');
        } else {
            console.log('Successfully added manager_name column');
        }
    } catch (err) {
        console.error(err);
    }
};

updateSchemaManager();
