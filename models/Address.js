/**
 * Module representing the Address model.
 * @module Address
 */

const mongoose = require('mongoose');

// Define schema for Address
const AddressSchema = new mongoose.Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
});

// Export the Address model
module.exports = mongoose.model('Address', AddressSchema);
