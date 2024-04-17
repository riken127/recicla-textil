const mongoose = require('mongoose');
const Address = require('../Address');

const UserSchema = new mongoose.Schema({
    lastName: { type: String, required: true },
    firstName: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    image: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    roles: [{
        type: String,
        enum: ['administrator', 'employee', 'user', 'moderator'],
        default: 'user'
    }],
    address: { type: Address.schema, required: true },
    phone: { type: String, required: true },
    leafs: { type: Number, required: true, default: 0},
    language: { type: String, required: true },
    title: [{
        type: String,
        enum: ['rookie', 'novice', 'master', 'king', 'caregiver'],
        default: 'rookie'
    }],
    notify: { type: Boolean, required: true }
});

module.exports = mongoose.model('User', UserSchema);
