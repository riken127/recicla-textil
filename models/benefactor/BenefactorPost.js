/**
 * Module representing the BenefactorPost model.
 * @module BenefactorPost
 */

const mongoose = require('mongoose');

// Define schema for Link
const LinkSchema = new mongoose.Schema({
    link: { type: String, required: true },
    title: { type: String, required: true },
    onHover: { type: String, required: true }
});

// Define schema for BenefactorPost
const BenefactorPostSchema = new mongoose.Schema({
    benefactorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Benefactor', required: true }, // Reference to Benefactor model
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    links: [LinkSchema] // Array of Link documents
});

// Export the BenefactorPost model
module.exports = mongoose.model('BenefactorPost', BenefactorPostSchema);
