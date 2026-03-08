try {
    const shiftController = require('./controllers/shiftController');
    console.log('ShiftController keys:', Object.keys(shiftController));
    const auth = require('./middleware/auth');
    console.log('Auth keys:', Object.keys(auth));
} catch (e) {
    console.error('Loader Error:', e.stack);
}
