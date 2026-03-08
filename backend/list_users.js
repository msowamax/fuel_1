const supabase = require('./supabase');
require('dotenv').config();

const listUsers = async () => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, name, email, role, is_approved, created_at');

        if (error) {
            console.error('Error:', error);
        } else {
            console.log('--- Current Users in Table ---');
            console.table(data);
        }
    } catch (err) {
        console.error(err);
    }
};

listUsers();
