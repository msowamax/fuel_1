const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const fixDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('users');

        console.log('Checking indexes...');
        const indexes = await collection.indexes();
        console.log('Current Indexes:', JSON.stringify(indexes, null, 2));

        const phoneIndex = indexes.find(idx => idx.name === 'phone_1' || idx.key.phone);
        if (phoneIndex) {
            console.log('Dropping index phone_1...');
            await collection.dropIndex(phoneIndex.name);
            console.log('Index dropped successfully.');
        } else {
            console.log('No unique phone index found.');
        }

        // Also check for 'email_1' to ensure it's there
        const emailIndex = indexes.find(idx => idx.name === 'email_1' || idx.key.email);
        if (!emailIndex) {
            console.log('Creating unique index for email...');
            await collection.createIndex({ email: 1 }, { unique: true });
            console.log('Email index created.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error fixing database:', error);
        process.exit(1);
    }
};

fixDatabase();
