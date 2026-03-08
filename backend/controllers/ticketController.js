const supabase = require('../supabase');
const crypto = require('crypto');

const generateTicketId = () => {
    return `TK-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
};

const createTicket = async (req, res) => {
    console.log('--- Ticket Creation Started ---');
    console.log('Body:', JSON.stringify(req.body));

    try {
        let { quantity, pricePerGallon, totalAmount, fuelType, paymentMethod, companyId, stationName, notificationNumber, managerName } = req.body;

        // --- Notification Check ---

        // Check for notificationNumber uniqueness if provided
        if (notificationNumber) {
            const { data: existing, error: checkError } = await supabase
                .from('fuel_tickets')
                .select('id')
                .eq('notification_number', notificationNumber)
                .maybeSingle();

            if (existing) {
                return res.status(400).send({ error: 'رقم الإشعار المرفق مستخدم مسبقاً' }); // Arabic error for "Notification number already used"
            }
        }

        const unitPrice = parseFloat(pricePerGallon);
        if (!quantity && totalAmount && unitPrice > 0) {
            quantity = (parseFloat(totalAmount) / unitPrice).toFixed(3);
        }

        const total_price = totalAmount || (parseFloat(quantity) * unitPrice);
        const ticket_id = generateTicketId();
        const finalQuantity = parseFloat(quantity);

        // --- Inventory Check & Deduction ---
        const { data: currentStock, error: stockFetchErr } = await supabase
            .from('fuel_inventory')
            .select('current_quantity')
            .eq('fuel_type', fuelType)
            .single();

        if (stockFetchErr || !currentStock) {
            return res.status(400).send({ error: 'تعذر التحقق من المخزون' }); // Arabic: Could not check stock
        }

        if (Number(currentStock.current_quantity) < finalQuantity) {
            return res.status(400).send({ error: 'كمية الوقود المتوفرة في المخزون غير كافية' }); // Arabic: Insufficient fuel stock
        }

        // Deduct from inventory
        const { error: deductErr } = await supabase
            .from('fuel_inventory')
            .update({
                current_quantity: Number(currentStock.current_quantity) - finalQuantity,
                last_updated: new Date().toISOString()
            })
            .eq('fuel_type', fuelType);

        if (deductErr) {
            console.error('Inventory Deduction Error:', deductErr);
            return res.status(500).send({ error: 'فشل في تحديث المخزون' }); // Arabic: Failed to update stock
        }
        // ------------------------------------

        const insertData = {
            ticket_id,
            fuel_type: fuelType,
            quantity: finalQuantity,
            price_per_gallon: unitPrice,
            total_price: parseFloat(total_price),
            payment_method: paymentMethod,
            station_name: stationName || (req.user ? req.user.stationName : 'Main Station'),
            created_by: req.user ? req.user.id : null,
            notification_number: notificationNumber || null,
            manager_name: managerName || (req.user ? req.user.name : 'System')
        };

        if (companyId) {
            insertData.company_id = companyId;
        }

        const { data: ticket, error } = await supabase
            .from('fuel_tickets')
            .insert([insertData])
            .select()
            .single();

        if (error) {
            console.error('Supabase Insert Error:', error);
            // Reverse inventory deduction if ticket fails (Partial Rollback)
            await supabase
                .from('fuel_inventory')
                .update({ current_quantity: Number(currentStock.current_quantity) })
                .eq('fuel_type', fuelType);

            return res.status(400).send({ error: error.message || 'Database insert failed' });
        }

        res.status(201).send({
            ...ticket,
            ticketId: ticket.ticket_id,
            fuelType: ticket.fuel_type,
            stationName: ticket.station_name,
            totalPrice: ticket.total_price,
            pricePerGallon: ticket.price_per_gallon,
            paymentMethod: ticket.payment_method,
            createdAt: ticket.created_at
        });
    } catch (error) {
        console.error('Unexpected Ticket Creation Error:', error);
        res.status(500).send({ error: error.message || 'An unexpected error occurred during ticket creation' });
    }
};

const getTickets = async (req, res) => {
    try {
        const { ticketId, vehicleNumber, startDate, endDate, fuelType } = req.query;
        let query = supabase.from('fuel_tickets').select('*, users(name)');

        if (ticketId) query = query.ilike('ticket_id', `%${ticketId}%`);
        if (vehicleNumber) query = query.ilike('vehicle_number', `%${vehicleNumber}%`);
        if (fuelType) query = query.eq('fuel_type', fuelType);

        if (startDate) query = query.gte('created_at', startDate);
        if (endDate) query = query.lte('created_at', endDate);

        // --- Privacy Filtering ---
        if (req.user.role === 'admin') {
            // Admins see all tickets for their station
            query = query.eq('station_name', req.user.stationName);
        } else {
            // Employees see only their own tickets
            query = query.eq('created_by', req.user.id);
        }
        // -------------------------

        const { data: tickets, error } = await query.order('created_at', { ascending: false });

        if (error) return res.status(500).send({ error: error.message });

        const mappedTickets = tickets.map(t => ({
            ...t,
            ticketId: t.ticket_id,
            customerName: t.customer_name,
            vehicleNumber: t.vehicle_number,
            fuelType: t.fuel_type,
            stationName: t.station_name,
            totalPrice: t.total_price,
            pricePerGallon: t.price_per_gallon,
            quantity: t.quantity,
            createdAt: t.created_at,
            createdBy: t.users
        }));

        res.send(mappedTickets);
    } catch (error) {
        res.status(500).send({ error: error.message || 'Failed to fetch tickets' });
    }
};

const getStats = async (req, res) => {
    try {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();

        console.log(`Fetching stats for ${req.user.stationName} between ${startOfDay} and ${endOfDay}`);

        let query = supabase
            .from('fuel_tickets')
            .select('total_price, quantity, payment_method')
            .gte('created_at', startOfDay)
            .lte('created_at', endOfDay);

        // --- Privacy Filtering ---
        if (req.user.role === 'admin') {
            query = query.eq('station_name', req.user.stationName);
        } else {
            query = query.eq('created_by', req.user.id);
        }

        // --- Prepare Recent Activity Query ---
        let recentQuery = supabase
            .from('fuel_tickets')
            .select('ticket_id, created_at, total_price, fuel_type')
            .order('created_at', { ascending: false })
            .limit(5);

        if (req.user.role === 'admin') {
            recentQuery = recentQuery.eq('station_name', req.user.stationName);
        } else {
            recentQuery = recentQuery.eq('created_by', req.user.id);
        }

        // --- Parallel Fetching for Efficiency ---
        const [statsResult, recentResult] = await Promise.all([
            query,
            recentQuery
        ]);

        const { data: tickets, error: statsError } = statsResult;
        const { data: recentTickets, error: recentError } = recentResult;

        if (statsError) return res.status(500).send({ error: statsError.message });
        if (recentError) console.error('Error fetching recent tickets:', recentError);
        // -----------------------------------------

        const stats = tickets.reduce((acc, curr) => {
            const method = curr.payment_method;
            acc.totalSales += 1;
            acc.totalRevenue += Number(curr.total_price);
            acc.totalLiters += Number(curr.quantity);

            if (!acc.byMethod[method]) acc.byMethod[method] = 0;
            acc.byMethod[method] += Number(curr.total_price);

            return acc;
        }, {
            totalSales: 0,
            totalRevenue: 0,
            totalLiters: 0,
            byMethod: {},
            recentTickets: recentTickets || []
        });

        res.send(stats);
    } catch (error) {
        res.status(500).send({ error: error.message || 'Failed to fetch stats' });
    }
};

const updateTicket = async (req, res) => {
    try {
        const updates = { ...req.body };
        const { data: ticket, error } = await supabase
            .from('fuel_tickets')
            .update(updates)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) return res.status(400).send({ error: error.message });
        if (!ticket) return res.status(404).send();

        res.send(ticket);
    } catch (error) {
        res.status(400).send({ error: error.message || 'Failed to update ticket' });
    }
};

const deleteTicket = async (req, res) => {
    try {
        // Fetch ticket first to check ownership/permissions
        const { data: existing, error: fetchError } = await supabase
            .from('fuel_tickets')
            .select('created_by, id')
            .eq('id', req.params.id)
            .single();

        if (fetchError || !existing) return res.status(404).send({ error: 'Ticket not found' });

        // Permission check: Admin/Manager can delete anything, Employee only their own
        const isOwner = String(existing.created_by) === String(req.user.id);
        const isAuthorized = ['admin', 'manager'].includes(req.user.role) || isOwner;

        console.log(`Delete Attempt - User: ${req.user.id}, Role: ${req.user.role}, Owner: ${existing.created_by}, isOwner: ${isOwner}`);

        if (!isAuthorized) {
            return res.status(403).send({ error: 'You do not have permission to delete this ticket' });
        }

        const { data: ticket, error } = await supabase
            .from('fuel_tickets')
            .delete()
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) return res.status(500).send({ error: error.message });
        res.send(ticket);
    } catch (error) {
        res.status(500).send({ error: error.message || 'Failed to delete ticket' });
    }
};

module.exports = {
    createTicket,
    getTickets,
    getStats,
    updateTicket,
    deleteTicket
};
