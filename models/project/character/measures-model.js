const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const measuresSchema = new Schema({
  height: String,
  waist: String,
  shoulders: String,
  hips: String,
  leg: String,
  shoe: String,
  character: {
    type: Schema.Types.ObjectId,
    ref: 'Character'
  }
}, {
  timestamps: true
});

const Measures = mongoose.model('Measures', measuresSchema);

module.exports = Measures;