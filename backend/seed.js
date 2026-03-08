const supabase = require('./supabase');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const seedAdmin = async () => {
    try {
        console.log('--- Seeding Admin User to Supabase ---');

        // 1. Check if admin exists
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('email', 'admin@fuelstation.com')
            .maybeSingle();

        if (checkError) {
            console.error('Error checking user:', checkError.message);
            process.exit(1);
        }

        if (existingUser) {
            console.log('Admin user already exists.');
            process.exit(0);
        }

        // 2. Hash password
        const hashedPassword = await bcrypt.hash('adminpassword123', 10);

        // 3. Insert user
        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([
                {
                    id: require('crypto').randomUUID(),
                    name: 'Super Admin',
                    email: 'admin@fuelstation.com',
                    password: hashedPassword,
                    role: 'admin',
                    station_name: 'Main Station',
                    is_approved: true
                }
            ])
            .select()
            .single();

        if (insertError) {
            console.error('Error creating admin:', insertError.message);
            process.exit(1);
        }

        console.log('Admin user created successfully in Supabase');
        console.log('Email: admin@fuelstation.com');
        console.log('Password: adminpassword123');
        process.exit(0);
    } catch (error) {
        console.error('Unexpected Error seeding admin:', error.message);
        process.exit(1);
    }
};

seedAdmin();
