const supabase = require('./supabase');

async function testInventory() {
    console.log("Testing Inventory Insert...");
    const { data, error } = await supabase
        .from('fuel_inventory')
        .insert({
            fuel_type: 'Petrol',
            current_quantity: 100,
            last_updated: new Date().toISOString()
        })
        .select()
        .single();

    if (error) {
        console.error("Insert Error:", error);
    } else {
        console.log("Insert Success:", data);
    }
}

testInventory();
