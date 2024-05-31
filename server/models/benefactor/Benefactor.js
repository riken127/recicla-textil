/**
 * Module representing the Benefactor model.
 * @module Benefactor
 */

const mongoose = require('mongoose');
const Address = require('../Address');
/**
 * @swagger
 * components:
 *   schemas:
 *     PickPoint:
 *       type: object
 *       required:
 *         - street
 *         - city
 *         - postalCode
 *         - country
 *         - active
 *       properties:
 *         street:
 *           type: string
 *           description: The street of the pick point
 *           example: 123 Main St
 *         city:
 *           type: string
 *           description: The city of the pick point
 *           example: Springfield
 *         postalCode:
 *           type: string
 *           description: The postal code of the pick point
 *           example: 12345
 *         country:
 *           type: string
 *           description: The country of the pick point
 *           example: USA
 *         active:
 *           type: boolean
 *           description: Whether the pick point is active
 *           example: true
 */
const PickPointSchema = new mongoose.Schema({
    street: {type: String, required: true},
    city: {type: String, required: true},
    postalCode: {type: String, required: true},
    country: {type: String, required: true},
    active: {type: Boolean, required: true} // True if the PickPoint is active
});

/**
 * @swagger
 * components:
 *   schemas:
 *     ConvertationRatio:
 *       type: object
 *       required:
 *         - points
 *         - value
 *         - weightMetric
 *       properties:
 *         points:
 *           type: number
 *           description: The points for conversion
 *           example: 10
 *         value:
 *           type: number
 *           description: The value for conversion
 *           example: 100
 *         weightMetric:
 *           type: string
 *           description: The weight metric for conversion
 *           example: g
 */
const ConversionRatioSchema = new mongoose.Schema({
    points: {type: Number, required: true},
    value: {type: Number, required: true},
    weightMetric: {type: String, required: true},
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Benefactor:
 *       type: object
 *       required:
 *         - name
 *         - address
 *         - username
 *         - password
 *         - email
 *         - description
 *         - phone
 *         - convertationRatio
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the benefactor
 *           example: John Doe
 *         address:
 *           $ref: '#/components/schemas/Address'
 *         username:
 *           type: string
 *           description: The username of the benefactor
 *           example: johndoe
 *         password:
 *           type: string
 *           description: The password of the benefactor
 *           example: securepassword
 *         email:
 *           type: string
 *           description: The email of the benefactor
 *           example: johndoe@example.com
 *         description:
 *           type: string
 *           description: The description of the benefactor
 *           example: A generous benefactor
 *         phone:
 *           type: string
 *           description: The phone number of the benefactor
 *           example: 123-456-7890
 *         logo:
 *           type: string
 *           description: The logo of the benefactor
 *           example: https://example.com/logo.png
 *         banner:
 *           type: string
 *           description: The banner of the benefactor
 *           example: https://example.com/banner.png
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The creation date of the benefactor
 *           example: 2022-01-01T00:00:00Z
 *         lastUpdateAt:
 *           type: string
 *           format: date-time
 *           description: The last update date of the benefactor
 *           example: 2022-01-02T00:00:00Z
 *         pickpoints:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PickPoint'
 *         convertationRatio:
 *           $ref: '#/components/schemas/ConvertationRatio'
 *         status:
 *           type: string
 *           enum: ['active', 'inactive', 'pending']
 *           description: The status of the benefactor
 *           example: active
 */
const BenefactorSchema = new mongoose.Schema({
    name: {type: String, required: true},
    address: {type: Address.schema, required: true}, 
    username: {type: String, required: true},
    password: {type: String, required: true},
    email: {type: String, required: true},
    description: {type: String, required: true},
    phone: {type: String, required: true},
    logo: {type: String},
    banner: {type: String},
    createdAt: {type: Date, default: Date.now},
    lastUpdateAt: {type: Date, default: Date.now},
    pickpoints: [PickPointSchema], 
    conversionRatio: {type: ConversionRatioSchema, required: true},
    status:{
        type: String,
        enum: ['active', 'inactive', 'pending'],
        default: 'active'
    },
});

// Export the Benefactor model
module.exports = mongoose.model('Benefactor', BenefactorSchema);
