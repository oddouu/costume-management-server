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
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
  },
  characters: [{
    type: Schema.Types.ObjectId,
    ref: 'Character'
  }],
  scenes: [{
    type: Schema.Types.ObjectId,
    ref: 'Scene'
  }],
  costumes: [{
    type: Schema.Types.ObjectId,
    ref: 'Costume'
  }]
}, {
  timestamps: true
});

module.exports = model('Image', imageSchema);