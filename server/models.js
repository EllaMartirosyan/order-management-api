const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    email: { type: String, required: true },
    fullName: { type: String, required: true },
    fullAddress: { type: String, required: true },
    images: { type: [String], required: true },
    frameColor: { type: String, required: true },
    user: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = { Order };