const auth = require('./middleware/auth');
const companyController = require('./controllers/companyController');

console.log('Auth:', typeof auth.auth);
console.log('AdminAuth:', typeof auth.adminAuth);
console.log('GetCompanies:', typeof companyController.getCompanies);
