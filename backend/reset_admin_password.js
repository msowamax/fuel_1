const supabase = require('./supabase');
const bcrypt = require('bcryptjs');

async function reset() {
    const email = 'msowa.3.2004@gmail.com';
    const newPassword = '12345678';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    console.log(`--- Resetting password for ${email} ---`);

    const { data, error } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('email', email)
        .select();

    if (error) {
        console.error('Error resetting password:', error.message);
    } else {
        console.log('Password reset successfully to: 12345678');
        console.log('User updated:', data[0].email);
    }
}

reset();
