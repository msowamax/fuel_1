const supabase = require('./backend/supabase');

async function debug() {
    console.log('--- Debugging Dashboard Data ---');
    try {
        const { data: tickets, error } = await supabase
            .from('fuel_tickets')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            console.error('Error fetching tickets:', error);
            return;
        }

        console.log(`Found ${tickets.length} tickets in database.`);
        tickets.forEach(t => {
            console.log(`ID: ${t.ticket_id}, CreatedAt: ${t.created_at}, Station: ${t.station_name}, CreatedBy: ${t.created_by}, TotalPrice: ${t.total_price}`);
        });

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();

        console.log('--- Filter Simulation ---');
        console.log('Query StartOfDay (UTC):', startOfDay);
        console.log('Query EndOfDay (UTC):', endOfDay);

        const filtered = tickets.filter(t => t.created_at >= startOfDay && t.created_at <= endOfDay);
        console.log(`Tickets matching today's range: ${filtered.length}`);

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

debug();
