const supabase = require('./supabase');
require('dotenv').config();

const probeFinal = async () => {
    try {
        console.log('--- Probing Database State ---');

        // 1. Check fuel_tickets columns
        const { error: ticketError } = await supabase.from('fuel_tickets').insert({
            ticket_id: 'PROBE-' + Date.now(),
            fuel_type: 'Petrol',
            quantity: 1,
            price_per_gallon: 1,
            total_price: 1,
            payment_method: 'Cash',
            station_name: 'Test',
            notification_number: '9999' // Check if this column exists
        });

        if (ticketError) {
            console.log('fuel_tickets (notification_number) error:', ticketError.message);
        } else {
            console.log('fuel_tickets (notification_number) exists and works!');
        }

        // 2. Check companies existence
        const { error: companyError } = await supabase.from('companies').select('count');
        if (companyError) {
            console.log('companies table error:', companyError.message);
        } else {
            console.log('companies table exists!');
        }

        // 3. Check fuel_prices existence
        const { error: priceError } = await supabase.from('fuel_prices').select('count');
        if (priceError) {
            console.log('fuel_prices table error:', priceError.message);
        } else {
            console.log('fuel_prices table exists!');
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

probeFinal();
