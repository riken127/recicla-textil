/**
 * Module representing the User model.
 * @module User
 */

const mongoose = require('mongoose');
const Address = require('../Address'); // Assuming Address model exists

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - lastName
 *         - firstName
 *         - username
 *         - email
 *         - password
 *         - address
 *         - phone
 *         - language
 *         - notify
 *         - active
 *       properties:
 *         lastName:
 *           type: string
 *           description: Last name of the user
 *           example: Doe
 *         firstName:
 *           type: string
 *           description: First name of the user
 *           example: John
 *         username:
 *           type: string
 *           description: Username of the user
 *           example: johndoe
 *         email:
 *           type: string
 *           description: Email of the user
 *           example: johndoe@example.com
 *         password:
 *           type: string
 *           description: Password of the user
 *           example: securepassword
 *         image:
 *           type: string
 *           description: Image of the user
 *           example: https://example.com/user.jpg
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation date of the user
 *           example: "2024-05-15T12:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update date of the user
 *           example: "2024-05-15T14:30:00Z"
 *         roles:
 *           type: array
 *           items:
 *             type: string
 *             enum: ['administrator', 'employee', 'user', 'moderator']
 *           default: ['user']
 *           description: User roles
 *           example: ['administrator']
 *         address:
 *           $ref: '#/components/schemas/Address'
 *           description: Reference to Address schema
 *         phone:
 *           type: string
 *           description: Phone number of the user
 *           example: 999 999 999
 *         leafs:
 *           type: number
 *           description: Number of leafs
 *           default: 0
 *           example: 0
 *         language:
 *           type: string
 *           description: Language of the user
 *           example: en
 *         title:
 *           type: array
 *           items:
 *             type: string
 *             enum: ['rookie', 'novice', 'master', 'king', 'caregiver']
 *           default: ['rookie']
 *           description: Title of the user
 *           example: ['master']
 *         notify:
 *           type: boolean
 *           description: Notify user
 *           example: true
 *         active:
 *           type: boolean
 *           description: Active if the user is active
 *           example: true
 */

const UserSchema = new mongoose.Schema({
    lastName: {type: String, required: true},
    firstName: {type: String, required: true},
    username: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    image: {type: String, default: ''},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
    roles: [{
        type: String,
        enum: ['administrator', 'employee', 'user', 'moderator'],
        default: 'user'
    }],
    address: {type: Address.schema, required: true}, // Reference to Address schema
    phone: {type: String, required: true},
    leafs: {type: Number, required: true, default: 0},
    language: {type: String, required: true},
    title: [{
        type: String,
        enum: ['rookie', 'novice', 'master', 'king', 'caregiver'],
        default: 'rookie'
    }],
    notify: {type: Boolean, required: true},
    active: {type: Boolean, required: true} // True if the User is active
});

// Export the User model
module.exports = mongoose.model('User', UserSchema);
