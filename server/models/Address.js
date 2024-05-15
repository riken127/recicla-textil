/**
 * Module representing the Address model.
 * @module Address
 */

const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Address:
 *       type: object
 *       required:
 *         - street
 *         - city
 *         - postalCode
 *         - country
 *       properties:
 *         street:
 *           type: string
 *           description: The street of the address
 *           example: 123 Main St
 *         city:
 *           type: string
 *           description: The city of the address
 *           example: Springfield
 *         postalCode:
 *           type: string
 *           description: The postal code of the address
 *           example: 12345
 *         country:
 *           type: string
 *           description: The country of the address
 *           example: USA
 */
const AddressSchema = new mongoose.Schema({
    street: {type: String, required: true},
    city: {type: String, required: true},
    postalCode: {type: String, required: true},
    country: {type: String, required: true}
});

// Export the Address model
module.exports = mongoose.model('Address', AddressSchema);
