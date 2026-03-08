const supabase = require('./supabase');
require('dotenv').config();

const probeCompanies = async () => {
    try {
        const testId = require('crypto').randomUUID();
        const { error } = await supabase.from('companies').insert({
            id: testId,
            name: 'Test Company',
            max_credit: 1000
        });

        if (error) {
            console.log('Error Code:', error.code);
            console.log('Error Message:', error.message);
        } else {
            console.log('Insert into companies SUCCESS!');
            await supabase.from('companies').delete().eq('id', testId);
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

probeCompanies();
