const supabase = require('./supabase');

async function diag() {
    console.log('--- Diagnosing Users Table ---');
    try {
        const { data, error } = await supabase.from('users').select('*');
        if (error) {
            console.error('ERROR fetching users:', error);
            console.error('Error Code:', error.code);
            console.error('Error Hint:', error.hint);
        } else {
            console.log(`Success: Found ${data.length} users.`);
            data.forEach(u => console.log(`- ${u.email} (Approved: ${u.is_approved}, Role: ${u.role})`));
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

diag();
