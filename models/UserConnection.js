var mongoose = require('mongoose');

var userConnection = new mongoose.Schema({
  UserID:String,
  connection: Object,
  rsvp: String});

var userConnectionModel = mongoose.model('userConnectionModel', userConnection, "userConnection");

module.exports.userConnectionModel = userConnectionModel;
