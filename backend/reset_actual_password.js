const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log('Fetching public users...');
    const { data: pusers, error } = await supabase.from('users').select('id, email');
    if (error) {
        console.error('Fetch error:', error);
        process.exit(1);
    }

    for (const email of ['msowa.3.2004@gmail.com', 'admin@example.com']) {
        const u = pusers.find(x => x.email === email);
        if (u) {
            console.log('Found UUID for', email, ':', u.id);
            const { error: updErr, data } = await supabase.auth.admin.updateUserById(u.id, { password: 'password123' });
            console.log('Reset password for', email, 'to password123:', updErr ? updErr.message : 'SUCCESS', data?.user?.email);
        } else {
            console.log('User not found in public.users:', email);
        }
    }
    process.exit(0);
}

run();
