const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const connectDB = require('../config/database');
const User = require('../models/User');
const Article = require('../models/Article');
const Login = require('../models/Login');

async function migrateData() {
    await connectDB();
    
    // Migrate users
    const usersData = JSON.parse(fs.readFileSync('./userData.JSON', 'utf8'));
    await User.insertMany(usersData);
    console.log('Users migrated');
    
    // Migrate login credentials
    const loginData = JSON.parse(fs.readFileSync('./Login.JSON', 'utf8'));
    // Add role field based on email
    const loginsWithRoles = loginData.map(login => ({
        ...login,
        role: login.email === 'admin@example.com' ? 'admin' : 'author'
    }));
    await Login.insertMany(loginsWithRoles);
    console.log('Login credentials migrated');
    
    // Migrate articles
    const articlesData = JSON.parse(fs.readFileSync('./articles.json', 'utf8'));
    await Article.insertMany(articlesData);
    console.log('Articles migrated');
    
    console.log('Migration complete!');
    process.exit(0);
}

migrateData().catch(err => {
    console.error('Migration error:', err);
    process.exit(1);
});