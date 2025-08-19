const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  brand: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  year: { type: Number, required: true },
  status: { type: String, enum: ['AVAILABLE', 'SOLD', 'HIDDEN', 'PENDING', 'REJECTED'], default: 'AVAILABLE' },
  condition: { type: String, enum: ['NEW', 'USED'], default: 'USED' },
  mileageKm: { type: Number, default: 0 },
  description: { type: String },
  images: [{ type: String }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: String,
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  purchasedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  purchasedAt: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

carSchema.index({ name: 'text', brand: 'text', description: 'text' });

module.exports = mongoose.model('Car', carSchema);
