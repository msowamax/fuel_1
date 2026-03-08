const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function revealSchema() {
    console.log('--- Revealing Schema via Insert ---');
    const id = 'SCHEMA-CHECK-' + Date.now();
    const payload = {
        ticket_id: id,
        fuel_type: 'Petrol',
        quantity: 1,
        price_per_gallon: 100,
        total_price: 100,
        payment_method: 'Cash',
        station_name: 'Schema Check'
    };

    try {
        const { data, error } = await supabase
            .from('fuel_tickets')
            .insert([payload])
            .select()
            .single();

        if (error) {
            console.error('Insert failed:', error.message);
            return;
        }

        console.log('SUCCESS! All column names in the table:');
        console.log(Object.keys(data).sort().join(', '));

        // Cleanup
        await supabase.from('fuel_tickets').delete().eq('ticket_id', id);
    } catch (e) {
        console.error('System Error:', e.message);
    }
}

revealSchema();
