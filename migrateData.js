const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/database');
const User = require('./models/User');
const Article = require('./models/Article');

async function migrateData() {
    await connectDB();
    
    // Wait for connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
        // Migrate users
        const usersData = JSON.parse(fs.readFileSync('./userData.JSON', 'utf8'));
        await User.deleteMany({}); // Clear existing
        await User.insertMany(usersData);
        console.log('✓ Users migrated');
        
        // Migrate articles
        const articlesData = JSON.parse(fs.readFileSync('./articles.json', 'utf8'));
        await Article.deleteMany({}); // Clear existing
        await Article.insertMany(articlesData);
        console.log('✓ Articles migrated');
        
        console.log('\n Migration complete!');
    } catch (error) {
        console.error(' Migration error:', error.message);
    }
    
    process.exit(0);
}

migrateData().catch(err => {
    console.error('Migration error:', err);
    process.exit(1);
});