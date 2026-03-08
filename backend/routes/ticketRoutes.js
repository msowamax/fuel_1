const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { auth, adminAuth } = require('../middleware/auth');

router.post('/', auth, ticketController.createTicket);
router.get('/', auth, ticketController.getTickets);
router.get('/stats', auth, ticketController.getStats);
router.patch('/:id', auth, adminAuth, ticketController.updateTicket);
router.delete('/:id', auth, ticketController.deleteTicket);

module.exports = router;
