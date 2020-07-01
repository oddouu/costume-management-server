const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sceneSchema = new Schema({
  sceneNumber: String,
  storyDayNumber: String,
  description: String,
  timeOfDay: String,
  season: String,
  numberOfActors: Number,
  numberOfExtras: Number,
  location: {
    type: Schema.Types.ObjectId,
    ref: 'Location'
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
  },
  characters: [{
    type: Schema.Types.ObjectId,
    ref: 'Character'
  }],
  costumes: [{
    type: Schema.Types.ObjectId,
    ref: 'Costume'
  }],
}, {
  timestamps: true
});

const Scene = mongoose.model('Scene', sceneSchema);

module.exports = Scene;