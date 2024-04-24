/**
 * Module representing the UserActivity model.
 * @module UserActivity
 */

const mongoose = require('mongoose');

// Define schema for UserActivity
const UserActivitySchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}, // Reference to User model
    activityType: {
        type: String,
        enum: ['session', 'donation', 'profile', 'password', 'deletion', 'addition', 'points', 'announcement'],
        required: true
    },
    timestamp: {type: Date, default: Date.now, required: true},
    details: {type: mongoose.Schema.Types.Mixed},
    ip: {type: String, required: true},
});

// Define indexes for UserActivity collection
UserActivitySchema.index({userId: 1});
UserActivitySchema.index({activityType: 1});
UserActivitySchema.index({timestamp: -1});

// Export the UserActivity model
module.exports = mongoose.model('UserActivity', UserActivitySchema);
