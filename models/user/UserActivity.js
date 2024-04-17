const mongoose = require('mongoose');

const UserActivitySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    activityType: {
        type: String,
        enum: ['session', 'donation', 'profile', 'password', 'deletion', 'addition', 'points', 'announcement'],
        required: true
    },
    timestamp: { type: Date, default: Date.now, required: true },
    details: { type: mongoose.Schema.Types.Mixed },
    ip: { type: String, required: true },
});

UserActivitySchema.index({ userId: 1 });
UserActivitySchema.index({ activityType: 1 });
UserActivitySchema.index({ timestamp: -1 });

module.exports = mongoose.model('UserActivity', UserActivitySchema);
