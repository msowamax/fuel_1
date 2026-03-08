const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const columnsToTest = [
    'ticket_id', 'fuel_type', 'quantity', 'price_per_gallon', 'total_price',
    'payment_method', 'bank_name', 'reference_number', 'company_id',
    'station_name', 'created_by'
];

async function probeColumns() {
    console.log('--- Probing Columns ---');
    let currentPayload = { ticket_id: 'TEST-123' };

    for (let i = 0; i < 20; i++) { // Safety limit
        console.log('Testing payload:', JSON.stringify(currentPayload));
        const { error } = await supabase.from('fuel_tickets').insert([currentPayload]);

        if (!error) {
            console.log('Success! Payload accepted.');
            // Cleanup the test record
            await supabase.from('fuel_tickets').delete().eq('ticket_id', 'TEST-123');
            break;
        }

        console.log('Error received:', error.message);

        if (error.message.includes('not-null constraint')) {
            const match = error.message.match(/column "(.+)" of relation/);
            if (match) {
                const missingCol = match[1];
                console.log(`Missing required column: ${missingCol}`);
                // Add a dummy value based on likely type
                if (missingCol.includes('price') || missingCol.includes('quantity')) {
                    currentPayload[missingCol] = 0;
                } else {
                    currentPayload[missingCol] = 'TEST';
                }
                continue;
            }
        }

        if (error.message.includes('does not exist')) {
            const match = error.message.match(/column "(.+)" of relation/);
            if (match) {
                console.log(`CRITICAL: Column "${match[1]}" DOES NOT EXIST in database.`);
            }
            break;
        }

        break;
    }
}

probeColumns();
