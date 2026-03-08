const supabase = require('./supabase');
require('dotenv').config();

const debugSchema = async () => {
    try {
        console.log("--- Checking for Triggers and Tables ---");

        // Check for tables
        const { data: tables, error: tableError } = await supabase.rpc('execute_sql', {
            sql_query: "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public';"
        });

        if (tableError) {
            console.error("Error fetching tables:", tableError);
        } else {
            console.log("Tables found:", tables.map(t => t.tablename).join(', '));
        }

        // Check for triggers mentioning 'profiles'
        const { data: triggers, error: triggerError } = await supabase.rpc('execute_sql', {
            sql_query: "SELECT trigger_name, event_object_table, action_statement FROM information_schema.triggers WHERE action_statement ILIKE '%profiles%';"
        });

        if (triggerError) {
            console.error("Error fetching triggers:", triggerError);
        } else {
            console.log("Triggers referencing 'profiles':", JSON.stringify(triggers, null, 2));
        }

    } catch (err) {
        console.error("Unexpected error during debug:", err);
    }
};

debugSchema();
