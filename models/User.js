const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        minlength: 3
    },
    age: {
        type: Number,
        required: true,
        min: 1,
        max: 120
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    address: {
        type: String,
        required: true,
        minlength: 5
    },
    phoneNumber: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);