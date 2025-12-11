const mongoose = require('mongoose');
const connectDB = require('./config/database');
const Login = require('./models/Login');

async function migrateLogins() {
    await connectDB();
    
    // Your login credentials from Login.JSON
    const loginData = [
        {
            email: "user@example.com",
            password: "password123",
            role: "author"
        },
        {
            email: "admin@example.com",
            password: "admin456",
            role: "admin"
        }
    ];
    
    try {
        // Clear existing logins (optional)
        await Login.deleteMany({});
        
        // Insert login credentials
        await Login.insertMany(loginData);
        console.log('Login credentials migrated successfully!');
        console.log('You can now login with:');
        console.log('- user@example.com / password123 (author)');
        console.log('- admin@example.com / admin456 (admin)');
    } catch (error) {
        console.error('Migration error:', error);
    }
    
    process.exit(0);
}

migrateLogins();