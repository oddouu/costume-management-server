const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teamSchema = new Schema({
  teamName: String,
  users: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

const Team = mongoose.model('Team', userSchema);

module.exports = Team;