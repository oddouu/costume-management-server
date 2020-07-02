const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const locationSchema = new Schema({
  decor: String,
  locale: String,
  scenes: [{
    type: Schema.Types.ObjectId,
    ref: 'Scene'
  }]
}, {
  timestamps: true
});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;