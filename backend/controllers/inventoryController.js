const supabase = require('../supabase');

const getInventory = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('fuel_inventory')
            .select('*');

        if (error) return res.status(500).send({ error: error.message });
        res.send(data);
    } catch (err) {
        res.status(500).send(err);
    }
};

const updateInventory = async (req, res) => {
    try {
        if (!['admin', 'manager', 'employee'].includes(req.user.role)) return res.status(403).send({ error: 'Access denied' });

        const { fuelType, quantity } = req.body;

        const { data: current, error: fetchError } = await supabase
            .from('fuel_inventory')
            .select('current_quantity')
            .eq('fuel_type', fuelType)
            .single();

        let newQuantity = Number(quantity);

        if (!fetchError && current) {
            newQuantity = Number(current.current_quantity) + Number(quantity);
            const { data, error } = await supabase
                .from('fuel_inventory')
                .update({
                    current_quantity: newQuantity,
                    last_updated: new Date().toISOString()
                })
                .eq('fuel_type', fuelType)
                .select()
                .single();

            if (error) {
                if (error.code === '42501') throw error;
                return res.status(400).send({ error: error.message });
            }
            return res.send(data);
        } else {
            // Row might not exist, let's insert it
            const { data, error } = await supabase
                .from('fuel_inventory')
                .insert({
                    fuel_type: fuelType,
                    current_quantity: newQuantity,
                    last_updated: new Date().toISOString()
                })
                .select()
                .single();

            if (error) {
                if (error.code === '42501') throw error;
                return res.status(400).send({ error: error.message });
            }
            return res.send(data);
        }
    } catch (err) {
        if (err.code === '42501') {
            return res.status(400).send({
                error: 'RLS Violation',
                sqlFix: "ALTER TABLE public.fuel_inventory DISABLE ROW LEVEL SECURITY;"
            });
        }
        res.status(500).send({ error: err.message || err });
    }
};

module.exports = { getInventory, updateInventory };
