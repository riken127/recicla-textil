/**
 * Module representing the UserActivity model.
 * @module UserActivity
 */

const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     UserActivity:
 *       type: object
 *       required:
 *         - userId
 *         - activityType
 *         - timestamp
 *         - ip
 *       properties:
 *         userId:
 *           type: string
 *           description: The ID of the user involved in the activity
 *           example: 60a53b3478d7e645182c8159
 *         activityType:
 *           type: string
 *           enum: ['session', 'donation', 'profile', 'password', 'deletion', 'addition', 'points', 'announcement']
 *           description: The type of activity
 *           example: donation
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: The timestamp of the activity
 *           example: 2024-05-15T12:00:00Z
 *         details:
 *           type: object
 *           description: Additional details of the activity
 *         ip:
 *           type: string
 *           description: The IP address associated with the activity
 *           example: "192.168.0.1"
 */
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
    status: {
        type: String,
        enum: ['Canceled', 'Waiting Approval', 'On Going', 'Delivered'],
        default: 'Delivered'
    }
});

UserActivitySchema.index({userId: 1});
UserActivitySchema.index({activityType: 1});
UserActivitySchema.index({timestamp: -1});

module.exports = mongoose.model('UserActivity', UserActivitySchema);
