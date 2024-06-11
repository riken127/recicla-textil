/**
 * Module representing the Voucher model.
 * @module Voucher
 */
const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Prize:
 *       type: object
 *       required:
 *         - price
 *         - title
 *         - description
 *         - benefactor
 *       properties:
 *         price:
 *           type: number
 *           description: The price of the prize
 *         title:
 *           type: string
 *           description: The title of the prize
 *         description:
 *           type: string
 *           description: The description of the prize
 *         image:
 *           type: string
 *           description: The URL of the image
 *         benefactor:
 *           type: string
 *           description: The ID of the benefactor associated with the prize
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the prize was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the prize was last updated
 *       example:
 *         price: 100
 *         title: "Special Prize"
 *         description: "This is a special prize for the event"
 *         image: "http://example.com/image.jpg"
 *         benefactor: "60d2f3f4f342f3f4d2f3f4d2"
 *         createdAt: "2023-06-11T10:00:00.000Z"
 *         updatedAt: "2023-06-11T10:00:00.000Z"
 */
const PrizeSchema = new mongoose.Schema({
    price: {type: Number, required: true},
    title: {type: String, required: true},
    description: {type: String, required: true},
    image: {type: String},
    benefactor: {type: mongoose.Schema.Types.ObjectId, ref: 'Benefactor', required: true}
})

module.exports = mongoose.model('Prize', PrizeSchema);
