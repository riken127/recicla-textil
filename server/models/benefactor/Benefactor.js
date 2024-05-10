/**
 * Module representing the Benefactor model.
 * @module Benefactor
 */

const mongoose = require('mongoose');
const Address = require('../Address');
// Define schema for PickPoint
const PickPointSchema = new mongoose.Schema({
    street: {type: String, required: true},
    city: {type: String, required: true},
    postalCode: {type: String, required: true},
    country: {type: String, required: true},
    active: {type: Boolean, required: true} // True if the PickPoint is active
});
const ConvertationRatioSchema = new mongoose.Schema({
    points: {type: Number, required: true},
    value: {type: Number, required: true},
    weigthMetric: {type: String, required: true},
});

// Define schema for Benefactor
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
    convertationRatio: {type: ConvertationRatioSchema, required: true}, 
    status:{
        type: String,
        enum: ['active', 'inactive', 'pending'],
        default: 'active'
    },
});

// Export the Benefactor model
module.exports = mongoose.model('Benefactor', BenefactorSchema);
