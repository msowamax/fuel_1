const supabase = require('./supabase');
const crypto = require('crypto');

async function test() {
    console.log('Inserting into public.users directly to test constraints...');
    const id = crypto.randomUUID();
    const email = 'test_constraint_' + Date.now() + '@example.com';

    // Simulate what the trigger does
    const { data: user, error } = await supabase
        .from('users')
        .insert([
            {
                id: id,
                email: email,
                name: 'Test',
                station_name: 'TestStation',
                role: 'employee',
                is_approved: true
            }
        ])
        .select()
        .single();

    if (error) {
        console.error('Trigger/Constraint Error Details:', JSON.stringify(error, null, 2));
    } else {
        console.log('Inserted successfully:', user);

        // Cleanup if successful
        await supabase.from('users').delete().eq('id', id);
    }
}

test();
