const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const measuresSchema = new Schema({
  heightMeasures: Number,
  shouldersMeasures: Number,
  chestMeasures: Number,
  waistMeasures: Number,
  hipsMeasures: Number,
  armMeasures: Number,
  legMeasures: Number,
  unitMeasure: String,
  shirtSize: String,
  coatSize: String,
  trousersSize: String,
  shoeSize: String,
  suitSize: String,
  braSize: String,
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
  },
  character: {
    type: Schema.Types.ObjectId,
    ref: 'Character'
  }
}, {
  timestamps: true
});

const actorMeasures = mongoose.model('actorMeasures', measuresSchema);

module.exports = actorMeasures;
