const mongoose = require('mongoose');  

var userSchema = new mongoose.Schema({
  username: {type: String, unique: true, required: true, trim: true, lowercase: true},
  password: {type: String, required: true, trim: true},
  firstname: {type: String, required: true, trim: true},
  lastname: {type: String, required: true, trim: true},
  email: {type: String, required: true, trim: true, lowercase: true},
  mobile: {type: String, trim: true}
}, {collection: 'users', timestamps: true});

var users = mongoose.model('User', userSchema);

module.exports = users;