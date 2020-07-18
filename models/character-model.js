const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const characterSchema = new Schema({
  characterName: String,
  actorName: String,
  age: String,
  image: {
    type: Schema.Types.ObjectId,
    ref: 'Image'
  },
  numberOfCostumes: Number,
  measures: {
    type: Schema.Types.ObjectId,
    ref: 'Measures'
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
  },
  scenes: [{
    type: Schema.Types.ObjectId,
    ref: 'Scene'
  }],
  costumes: [{
    type: Schema.Types.ObjectId,
    ref: 'Costume'
  }],
}, {
  timestamps: true
});

const Character = mongoose.model('Character', characterSchema);

module.exports = Character;