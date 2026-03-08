const supabase = require('../supabase');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`--- Login attempt for: ${email} ---`);

        // 1. Fetch user from public.users to find their custom hash
        const { data: user, error: dbError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .maybeSingle();   // maybeSingle: won't error on 0 rows, won't error on multiple rows

        if (dbError) {
            console.error(`Login DB error for ${email}:`, dbError.message, dbError.code);
            return res.status(401).send({ error: 'Invalid login credentials' });
        }

        if (!user) {
            console.error(`Login error: User not found in public.users for email: ${email}`);
            return res.status(401).send({ error: 'Invalid login credentials' });
        }


        let isMatch = false;

        // 2. Try custom bcrypt hash first (useful for admin overrides and manually synced users)
        if (user.password && user.password.startsWith('$2')) {
            const bcrypt = require('bcryptjs');
            isMatch = await bcrypt.compare(password, user.password);
        }

        // 3. If bcrypt didn't match (e.g., password is 'supabase_auth_managed'), fallback to Supabase Auth
        if (!isMatch) {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (!authError && authData.user) {
                isMatch = true;
            }
        }

        if (!isMatch) {
            console.log(`Login failed for: ${email}`);
            return res.status(401).send({ error: 'Invalid login credentials' });
        }

        if (!user.is_approved) {
            console.log(`Login failed: User ${email} is not approved.`);
            return res.status(403).send({ error: 'Account pending manager approval' });
        }

        console.log(`Login success: ${email}`);

        // Sign custom JWT to maintain compatibility with the rest of the app's middleware
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        const sanitizedUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            stationName: user.station_name,
            logoUrl: user.logo_url,
            is_approved: user.is_approved
        };

        res.send({ user: sanitizedUser, token });
    } catch (err) {
        console.error(`Unexpected login error: ${err.message}`);
        res.status(500).send({ error: 'Internal server error' });
    }
};

const signup = async (req, res) => {
    try {
        const { name, email, password, stationName, role } = req.body;
        const bcrypt = require('bcryptjs');

        // Hash the password upfront — we will always store this in public.users
        const hashedPassword = await bcrypt.hash(password, 10);

        // Try Supabase Admin API first to create authenticated user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                name,
                station_name: stationName,
                role: role || 'admin'
            }
        });

        let userRecordId;

        if (authError) {
            // If supabase admin fails, check if user already exists in public.users
            if (authError.message.includes('already exists')) {
                return res.status(400).send({ error: 'Email already exists' });
            }
            console.warn('Supabase Admin createUser failed:', authError.message);
            console.warn('Falling back to public.users-only registration...');
            // Generate a UUID for the user manually
            const { v4: uuidv4 } = require('uuid');
            userRecordId = uuidv4();
        } else {
            userRecordId = authData.user.id;
        }

        // Fetch from public.users (trigger may have populated it)
        let { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('id', userRecordId)
            .single();

        if (!user) {
            // Insert manually if trigger didn't fire or Supabase Admin was bypassed
            console.log('Manually inserting into public.users...');
            const { data: newUser, error: insertErr } = await supabase.from('users').insert({
                id: userRecordId,
                email,
                password: hashedPassword,   // Always a real bcrypt hash
                name,
                role: role || 'admin',
                station_name: stationName,
                is_approved: true
            }).select().single();

            if (insertErr || !newUser) {
                console.error('Manual insert failed:', insertErr);
                return res.status(400).send({ error: 'Registration failed to sync' });
            }
            user = newUser;
        } else {
            // User was found (trigger fired) — always overwrite password with real bcrypt hash
            // This prevents 'supabase_auth_managed' from being stored, which would break login
            await supabase
                .from('users')
                .update({ password: hashedPassword })
                .eq('id', userRecordId);
            user.password = hashedPassword;
            console.log(`Bcrypt hash synced to public.users for: ${email}`);
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        const sanitizedUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            stationName: user.station_name,
            is_approved: user.is_approved
        };

        res.status(201).send({ user: sanitizedUser, token });
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
};

const verifyPassword = async (req, res) => {
    try {
        const { password } = req.body;
        // req.user contains the user from public.users fetched in auth middleware
        const { email, password: hashedUserPwd } = req.user;

        let isMatch = false;

        if (hashedUserPwd && hashedUserPwd.startsWith('$2')) {
            const bcrypt = require('bcryptjs');
            isMatch = await bcrypt.compare(password, hashedUserPwd);
        }

        if (!isMatch) {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (!error) isMatch = true;
        }

        if (!isMatch) {
            return res.status(401).send({ error: 'Incorrect password' });
        }

        res.status(200).send({ success: true });
    } catch (err) {
        res.status(400).send({ error: err.message || 'Verification failed' });
    }
};

module.exports = { login, signup, verifyPassword };
