/**
 * Module representing the Voucher model.
 * @module Voucher
 */
const mongoose = require('mongoose');

const PrizeSchema = new mongoose.Schema({
	price: {type: Number, required: true},
	title: {type: String, required: true},
	description: {type: String, required: true},
	image: {type: String},
	benefactor: {type: mongoose.Schema.Types.ObjectId, ref: 'Benefactor', required: true}
})

module.exports = mongoose.model('Prize', PrizeSchema);
