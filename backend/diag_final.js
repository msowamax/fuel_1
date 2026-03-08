const supabase = require('./supabase');

async function checkRLS() {
    console.log('--- Checking RLS Status via JS ---');
    // If RLS is ON and key is NOT service role, this returns 0 or error depending on policy
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });

    if (error) {
        console.error('Fetch Error:', error.message);
    } else {
        console.log('Row count accessible with current key:', data);
    }
}

checkRLS();
