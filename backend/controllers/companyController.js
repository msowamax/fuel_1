const supabase = require('../supabase');

const getCompanies = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('companies')
            .select('*')
            .order('name');

        if (error) return res.status(500).send({ error: error.message });
        res.send(data);
    } catch (err) {
        res.status(500).send(err);
    }
};

module.exports = { getCompanies };
