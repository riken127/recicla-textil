/**
 * Module representing the Offer model.
 * @module Offer
 */

const mongoose = require('mongoose');
/**
 * @swagger
 * components:
 *   schemas:
 *     Offer:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "665db5223dcb0ae0df44cc7f"
 *         startDate:
 *           type: string
 *           format: date-time
 *           example: "2005-10-10T00:00:00.000Z"
 *         endDate:
 *           type: string
 *           format: date-time
 *           example: "2006-10-10T00:00:00.000Z"
 *         benefactor:
 *           type: string
 *           example: "66341183612bf8d5aff074f0"
 *         title:
 *           type: string
 *           example: "Very Nice Offer"
 *         description:
 *           type: string
 *           example: "Awesome Offer!"
 *         image:
 *           type: string
 *           example: ""
 *         points:
 *           type: integer
 *           example: 700
 *         active:
 *           type: boolean
 *           example: true
 *     Error:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           example: error
 *         message:
 *           type: string
 *           example: Invalid parameters
 */

const OfferSchema = new mongoose.Schema({
    startDate: {type: Date, required: true, default: Date.now},
    endDate: {type: Date, required: true},
    benefactor: {type: mongoose.Schema.Types.ObjectId, ref: 'Benefactor', required: true},
    title: {type: String, required: true},
    description: {type: String, required: true},
    image: {type: String},
    points: {type: Number, required: true},
    active: {type: Boolean, default: true}
});

module.exports = mongoose.model('Offer', OfferSchema);
