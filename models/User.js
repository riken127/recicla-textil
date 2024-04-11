const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    lastName: {type: String, required: true},
    firstName: {type: String, required: true},
    username: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    image: {type: String},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
    roles: {
        type: [{
            type: String,
            enum: ['administrator', 'employee', 'user', 'moderator'],
            default: 'user'
        }]
    },
    address: {
        street: {type: String, required: true},
        city: {type: String, required: true},
        postalCode: {type: String, required: true},
        country: {type: String, required: true},
    },
    phone: {type: String, required: true},
    leafs: {type: Number, required: true},
    language: {type: String, required: true},
    title: {
        type: [{
            type: String,
            enum: ['rookie', 'novice', 'master', 'king', 'caregiver'],
            default: 'rookie'
        }]
    },
    notify: {
        type: Boolean,
        required: true
    }
});

module.exports = mongoose.model('User', UserSchema);
