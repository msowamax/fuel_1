const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const listUsers = async () => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('email, role, is_approved');

        if (error) throw error;
        console.log('--- Users in Database ---');
        console.table(data);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

listUsers();
