const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const costumeSchema = new Schema({
  costumeNumber: String,
  description: String,
  elements: [String],
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
  },
  scenes: [{
    type: Schema.Types.ObjectId,
    ref: 'Scene'
  }],
  character: {
    type: Schema.Types.ObjectId,
    ref: 'Character'
  },
}, {
  timestamps: true
});

const Costume = mongoose.model('Costume', costumeSchema);

module.exports = Costume;