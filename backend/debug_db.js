const supabase = require('./supabase');
require('dotenv').config();

const debugDb = async () => {
    console.log('--- Database Diagnostics ---');
    console.log('URL:', process.env.SUPABASE_URL);
    // Hide most of the key for safety but show prefix/suffix
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    console.log('Key Length:', key.length);
    console.log('Key Sample:', key.substring(0, 10) + '...' + key.substring(key.length - 5));

    try {
        console.log('\nQuerying users table...');
        const { data, error, count } = await supabase
            .from('users')
            .select('*', { count: 'exact' });

        if (error) {
            console.error('Error fetching users:', error);
        } else {
            console.log('Users found:', data.length);
            console.log('Total count:', count);
            if (data.length > 0) {
                console.log('Last user email:', data[data.length - 1].email);
            }
        }

        console.log('\nTesting direct insert...');
        const testEmail = `test_${Date.now()}@example.com`;
        const { data: insertData, error: insertError } = await supabase
            .from('users')
            .insert([{
                id: require('crypto').randomUUID(),
                name: 'Test User',
                email: testEmail,
                password: 'password',
                station_name: 'Test Station',
                role: 'employee',
                is_approved: true
            }])
            .select();

        if (insertError) {
            console.error('Insert failed:', insertError);
        } else {
            console.log('Insert succeeded for:', testEmail);
            console.log('Inserted record:', insertData);
        }

    } catch (err) {
        console.error('Unexpected error during diagnostics:', err);
    }
};

debugDb();
