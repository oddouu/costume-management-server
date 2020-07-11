const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
  title: String,
  description: String,
  movieDirectorName: String,
  scriptWriter: String,
  date: Date,
  productionName: String,
  numberOfScenes: Number,
  numberOfCharacters: Number,
  locations: [{
    type: Schema.Types.ObjectId,
    ref: 'Location'
  }],
  scenes: [{
    type: Schema.Types.ObjectId,
    ref: 'Scene'
  }],
  characters: [{
    type: Schema.Types.ObjectId,
    ref: 'Character'
  }],
  // costumes: [{
  //   type: Schema.Types.ObjectId,
  //   ref: 'Costume'
  // }],
  // teams: [{
  //   type: Schema.Types.ObjectId,
  //   ref: 'Team'
  // }],
  users: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
}, {
  timestamps: true
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;