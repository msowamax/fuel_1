const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function probeFinal() {
    console.log('--- Probing Final Schema ---');
    // Base payload with valid fuel_type
    let base = {
        ticket_id: 'PROBE-' + Date.now(),
        fuel_type: 'Petrol',
        quantity: 1,
        price_per_gallon: 100,
        total_price: 100,
        payment_method: 'Cash',
        station_name: 'Probe Station'
    };

    console.log('Testing base payload...');
    const { error: baseError } = await supabase.from('fuel_tickets').insert([base]);

    if (baseError) {
        console.log('Base payload failed:', baseError.message);
        if (baseError.message.includes('not-null')) {
            console.log('Next missing column:', baseError.message.match(/column "(.+)"/)[1]);
        }
    } else {
        console.log('Base payload SUCCESS! Cleaning up...');
        await supabase.from('fuel_tickets').delete().eq('ticket_id', base.ticket_id);
    }

    // Now test if price_per_liter exists (maybe I renamed it in code but not in DB?)
    console.log('\nTesting price_per_liter existence...');
    const { error: literError } = await supabase.from('fuel_tickets').select('price_per_liter').limit(1);
    console.log('price_per_liter exists:', !literError);

    // Now test notification column name
    console.log('\nTesting reference_number existence...');
    const { error: refError } = await supabase.from('fuel_tickets').select('reference_number').limit(1);
    console.log('reference_number exists:', !refError);

    console.log('\nTesting notification_digits existence...');
    const { error: notifError } = await supabase.from('fuel_tickets').select('notification_digits').limit(1);
    console.log('notification_digits exists:', !notifError);

    // Test created_by
    console.log('\nTesting created_by existence...');
    const { error: userError } = await supabase.from('fuel_tickets').select('created_by').limit(1);
    console.log('created_by exists:', !userError);
}

probeFinal();
