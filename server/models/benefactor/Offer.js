/**
 * Module representing the Offer model.
 * @module Offer
 */

const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema({
    startDate: {type: Date, required: true, default: Date.now},
    endDate: {type: Date, required: true},
    benefactor: {type: mongoose.Schema.Types.ObjectId, ref: 'Benefactor', required: true},
    title: {type: String, required: true},
    description: {type: String, required: true},
    image: {type: String},
    active: {type: Boolean, default: true}
});

module.exports = mongoose.model('Offer', OfferSchema);
