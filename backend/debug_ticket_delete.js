const supabase = require('./supabase');

async function debugTicketDelete() {
    const ticketId = '3f09bb21-b2de-4603-b918-0d9a83f26bfb';
    const userEmail = 'msowa.3.2004@gmail.com';

    console.log(`--- Debugging Ticket: ${ticketId} ---`);

    const { data: ticket, error: tErr } = await supabase
        .from('fuel_tickets')
        .select('*')
        .eq('id', ticketId)
        .single();

    if (tErr) {
        console.error("Ticket Fetch Error:", tErr);
    } else {
        console.log("Ticket Data:", JSON.stringify(ticket, null, 2));
    }

    const { data: user, error: uErr } = await supabase
        .from('users')
        .select('*')
        .eq('email', userEmail)
        .single();

    if (uErr) {
        console.error("User Fetch Error:", uErr);
    } else {
        console.log("User Data:", JSON.stringify({ id: user.id, role: user.role, email: user.email }, null, 2));

        if (ticket) {
            console.log("\nPermission Check Logic:");
            const isOwner = ticket.created_by === user.id;
            const isAuthorized = ['admin', 'manager'].includes(user.role) || isOwner;
            console.log(`isOwner: ${isOwner} (ticket.created_by === user.id)`);
            console.log(`User Role: ${user.role}`);
            console.log(`isAuthorized: ${isAuthorized}`);
        }
    }
}

debugTicketDelete();
