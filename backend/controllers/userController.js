const supabase = require('../supabase');

const getUsers = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).send({ error: 'Access denied' });

        const { data, error } = await supabase
            .from('users')
            .select('id, name, email, role, station_name, is_approved, created_at')
            .eq('station_name', req.user.stationName) // Filter by admin's station
            .order('created_at', { ascending: false });

        if (error) return res.status(500).send({ error: error.message });

        // Map to camelCase
        const mappedUsers = data.map(u => ({
            ...u,
            stationName: u.station_name,
            isApproved: u.is_approved,
            createdAt: u.created_at
        }));

        res.send(mappedUsers);
    } catch (err) {
        res.status(500).send(err);
    }
};

const approveUser = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).send({ error: 'Access denied' });

        const { id } = req.params;
        const { isApproved } = req.body;

        const { data, error } = await supabase
            .from('users')
            .update({ is_approved: isApproved })
            .eq('id', id)
            .select()
            .single();

        if (error) return res.status(400).send({ error: error.message });
        res.send(data);
    } catch (err) {
        res.status(400).send(err);
    }
};

const updateRole = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).send({ error: 'Access denied' });

        const { id } = req.params;
        const { role } = req.body;

        if (!['admin', 'employee', 'worker'].includes(role)) {
            return res.status(400).send({ error: 'Invalid role' });
        }

        const { data, error } = await supabase
            .from('users')
            .update({ role })
            .eq('id', id)
            .select()
            .single();

        if (error) return res.status(400).send({ error: error.message });
        res.send(data);
    } catch (err) {
        res.status(400).send(err);
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, logoUrl, stationName } = req.body;
        const updates = {};
        if (name) updates.name = name;
        if (logoUrl !== undefined) updates.logo_url = logoUrl;
        if (stationName) updates.station_name = stationName;

        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', req.user.id)
            .select()
            .single();

        if (error) return res.status(400).send({ error: error.message });

        // Map to camelCase
        const sanitized = {
            ...data,
            stationName: data.station_name,
            logoUrl: data.logo_url
        };
        res.send(sanitized);
    } catch (err) {
        res.status(400).send(err);
    }
};

const uploadLogo = async (req, res) => {
    try {
        if (!req.file) return res.status(400).send({ error: 'No file uploaded' });

        const file = req.file;
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${req.user.id}-${Date.now()}.${fileExt}`;
        const filePath = `logos/${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('station-logos')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: true
            });

        if (error) {
            console.error('--- Supabase Storage Error ---');
            console.error(error);
            if (error.message && error.message.includes('not found')) {
                return res.status(400).send({
                    error: 'Storage bucket "station-logos" not found. Please create it in Supabase Dashboard.',
                    sqlFix: "INSERT INTO storage.buckets (id, name, public) VALUES ('station-logos', 'station-logos', true) ON CONFLICT (id) DO NOTHING;"
                });
            }
            return res.status(400).send({ error: error.message });
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('station-logos')
            .getPublicUrl(filePath);

        // Update user profile with new logoUrl
        const { error: updateError } = await supabase
            .from('users')
            .update({ logo_url: publicUrl })
            .eq('id', req.user.id);

        if (updateError) return res.status(400).send({ error: updateError.message });

        res.send({ logoUrl: publicUrl });
    } catch (err) {
        console.error('Upload catch error:', err);
        res.status(500).send({ error: err.message });
    }
};

module.exports = { getUsers, approveUser, updateRole, updateProfile, uploadLogo };
