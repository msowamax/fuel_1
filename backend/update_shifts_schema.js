const supabase = require('./supabase');
require('dotenv').config();

const updateShiftsSchema = async () => {
    try {
        const { error } = await supabase.rpc('execute_sql', {
            sql_query: `ALTER TABLE shifts ADD COLUMN IF NOT EXISTS station_name TEXT;`
        });

        if (error) {
            console.log('execute_sql RPC failed, please run manually if needed:');
            console.log('ALTER TABLE shifts ADD COLUMN IF NOT EXISTS station_name TEXT;');
        } else {
            console.log('Successfully added station_name to shifts table');
        }
    } catch (err) {
        console.error(err);
    }
};

updateShiftsSchema();
