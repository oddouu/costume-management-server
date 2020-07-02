const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: String,
  password: String,
  teams: [{
    type: Schema.Types.ObjectId,
    ref: 'Team'
  }]
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;