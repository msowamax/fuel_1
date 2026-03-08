const jwt = require('jsonwebtoken');
const supabase = require('../supabase');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', decoded.id)
            .single();

        if (error || !user) {
            throw new Error();
        }

        if (!user.is_approved) {
            return res.status(403).send({ error: 'Account not authorized by manager' });
        }

        // Map to camelCase for consistent usage in backend logic
        user.stationName = user.station_name;

        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
};

const adminAuth = async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send({ error: 'Access denied. Admin only.' });
    }
    next();
};

module.exports = { auth, adminAuth };
