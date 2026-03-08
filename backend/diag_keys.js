const supabase = require('./supabase');

async function diag() {
    console.log('--- Diagnosing Supabase Keys & Data ---');

    // Check fuel_tickets
    console.log('\nChecking fuel_tickets...');
    const { data: tickets, error: ticketErr } = await supabase.from('fuel_tickets').select('*').limit(5);
    if (ticketErr) {
        console.error('Error fuel_tickets:', ticketErr.message);
    } else {
        console.log(`Success: Found ${tickets.length} tickets.`);
    }

    // Check fuel_inventory
    console.log('\nChecking fuel_inventory...');
    const { data: inv, error: invErr } = await supabase.from('fuel_inventory').select('*');
    if (invErr) {
        console.error('Error fuel_inventory:', invErr.message);
    } else {
        console.log(`Success: Found ${inv.length} inventory items.`);
    }
}

diag();
