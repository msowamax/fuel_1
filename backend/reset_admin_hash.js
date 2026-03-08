const supabase = require('./supabase');
const bcrypt = require('bcryptjs');

async function reset() {
    const newPassword = '12345678';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const emails = ['msowa.3.2004@gmail.com', 'admin@example.com', 'msowa.1.2004@gmail.com'];

    for (const email of emails) {
        console.log(`--- Resetting password for ${email} ---`);
        const { data, error } = await supabase
            .from('users')
            .update({ password: hashedPassword })
            .eq('email', email)
            .select();

        if (error) {
            console.error('Error resetting password for', email, ':', error.message);
        } else if (data && data.length > 0) {
            console.log('Password reset successfully to: 12345678 for', data[0].email);
        } else {
            console.log('User not found in public.users:', email);
        }
    }
}

reset();
