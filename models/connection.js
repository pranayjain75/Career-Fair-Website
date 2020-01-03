var mongoose = require('mongoose');

var connectionSchema = new mongoose.Schema({
  connectionId:{
    type: Number,
    required: true
  },
  connectionName:{
    type: String,
    required: true
  },
  connectionTopic:{
    type: String,
    required: true
  },
  connectionDetails:{
    type: String,
    required: true
  },
  connectionLocation:{
    type: String,
    required: true
  },
  connectionTime:{
    type: String,
    required: true
  },
  UserID:{
    type: Number,
    required: true
  }
});

var connectionModel = mongoose.model('connections',connectionSchema);

module.exports = connectionModel;
