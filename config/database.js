const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // MongoDB Atlas connection - password URL-encoded
        const uri = "mongodb+srv://danlittle010_db_user:BestP%40ls010%21@cluster0.varcw2l.mongodb.net/techtomorrow?retryWrites=true&w=majority";
        
        const conn = await mongoose.connect(uri);

        console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Error: ${error.message}`);
        console.log('Server will continue without MongoDB - using JSON files as fallback');
    }
};

module.exports = connectDB;
