const mongoose = require('mongoose');

const PickPointSchema = new mongoose.Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
});

const BenefactorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    logo: { type: String, required: true },
    banner: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    lastUpdateAt: { type: Date, default: Date.now },
    pickpoints: [PickPointSchema] // Array de pickpoints
});

module.exports = mongoose.model('Benefactor', BenefactorSchema);
