const supabase = require('./supabase');

async function debugInventory() {
    console.log("--- 1. Fetching Inventory ---");
    const { data: getResp, error: getErr } = await supabase.from('fuel_inventory').select('*');
    if (getErr) {
        console.error("GET ERROR:", getErr);
    } else {
        console.log("Current Rows:", getResp);
    }

    console.log("\n--- 2. Testing Update via RPC or Insert ---");
    const { data: insResp, error: insErr } = await supabase
        .from('fuel_inventory')
        .upsert({ fuel_type: 'Petrol', current_quantity: 50, last_updated: new Date().toISOString() }, { onConflict: 'fuel_type' })
        .select();

    if (insErr) {
        console.error("UPSERT ERROR:", insErr);
    } else {
        console.log("UPSERT SUCCESS:", insResp);
    }
}

debugInventory();
