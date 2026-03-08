const supabase = require('./supabase');
require('dotenv').config();

const listCompanies = async () => {
    try {
        const { data, error } = await supabase
            .from('companies')
            .select('*');

        if (error) {
            console.error('Error:', error.message);
            process.exit(1);
        }
        console.log('--- Companies in Database ---');
        console.table(data);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

listCompanies();
