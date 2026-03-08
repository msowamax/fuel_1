const supabase = require('./supabase');

async function probe() {
    console.log('--- Probing Database Schema ---');
    try {
        // List tables by querying pg_catalog via rpc or just common tables
        const tables = ['users', 'fuel_tickets', 'fuel_inventory', 'fuel_prices', 'companies', 'profiles', 'shifts'];

        for (const table of tables) {
            const { data, error } = await supabase.from(table).select('*').limit(1);
            if (error) {
                console.log(`Table ${table}: Error or Missing (${error.message})`);
            } else {
                console.log(`Table ${table}: Exists. First row keys: ${data.length > 0 ? Object.keys(data[0]).join(', ') : 'Empty'}`);
            }
        }

        // Check for functions (this is harder via JS client without RPC)
        console.log('\nNote: RPC functions like process_fuel_deduction should be checked manually in Supabase Dashboard.');

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

probe();
