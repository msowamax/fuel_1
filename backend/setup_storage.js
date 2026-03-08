const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function setup() {
    console.log('Checking storage bucket...');
    try {
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        if (listError) throw listError;

        const exists = buckets.find(b => b.name === 'station-logos');
        if (!exists) {
            console.log('Creating bucket: station-logos');
            const { error: createError } = await supabase.storage.createBucket('station-logos', {
                public: true,
                allowedMimeTypes: ['image/*'],
                fileSizeLimit: 5242880 // 5MB
            });
            if (createError) throw createError;
            console.log('Bucket created successfully.');
        } else {
            console.log('Bucket already exists.');
        }
    } catch (err) {
        console.error('Setup failed:', err.message);
        process.exit(1);
    }
    process.exit(0);
}

setup();
