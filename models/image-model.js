const mongoose = require('mongoose');
const {
  Schema,
  model
} = mongoose;

const imageSchema = new Schema({
  name: {
    type: String,
  },
  imageUrl: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = model('Image', imageSchema);