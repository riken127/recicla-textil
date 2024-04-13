const mongoose = require('mongoose');

const LinkSchema = new mongoose.Schema({
    link: { type: String, required: true },
    title: { type: String, required: true },
    onHover: { type: String, required: true }
});

const BenefactorPostSchema = new mongoose.Schema({
    benefactorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Benefactor', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    links: [LinkSchema]
});

module.exports = mongoose.model('BenefactorPost', BenefactorPostSchema);
