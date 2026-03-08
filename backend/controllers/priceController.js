const supabase = require('../supabase');

const getPrices = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('fuel_prices')
            .select('*');
        if (error) return res.status(500).send({ error: error.message });
        res.send(data);
    } catch (err) {
        res.status(500).send(err);
    }
};

const updatePrice = async (req, res) => {
    try {
        // Removed role check to allow all authenticated users to update prices as requested

        const { fuelType, pricePerGallon } = req.body;
        const { data, error } = await supabase
            .from('fuel_prices')
            .upsert({ fuel_type: fuelType, price_per_gallon: pricePerGallon })
            .select()
            .single();

        if (error) return res.status(400).send({ error: error.message });
        res.send(data);
    } catch (err) {
        res.status(400).send(err);
    }
};

module.exports = { getPrices, updatePrice };
