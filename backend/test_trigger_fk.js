const supabase = require('./supabase');

async function testTriggerFK() {
    console.log('Testing auth.users insert via API to observe trigger FK constraint...');

    const email = 'fk_test_' + Date.now() + '@example.com';
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: 'securePassword123!',
        email_confirm: true,
        user_metadata: {
            name: 'FK Test',
            station_name: 'TestStation',
            role: 'employee'
        }
    });

    if (authError) {
        console.error('Trigger FK Error Details:', authError);
    } else {
        console.log('Inserted successfully:', authData);
        // Clean up
        await supabase.auth.admin.deleteUser(authData.user.id);
    }
}

testTriggerFK();
