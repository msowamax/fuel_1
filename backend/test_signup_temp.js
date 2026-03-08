const supabase = require('./supabase');

async function test() {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'test_error@example.com',
        password: '123', // Short password
        email_confirm: true,
        user_metadata: {
            name: 'Test',
            station_name: 'Test',
            role: 'employee'
        }
    });

    console.log('authData:', authData);
    console.log('authError:', authError);
}

test();
