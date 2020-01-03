var mongoose = require('mongoose');

var schemaOptions = {
    timestamps: true,
    toJSON: {
      virtuals: true
    }
};

var UserProfileListSchema = new mongoose.Schema({
  connectionId:{
    type: Number
    
  },
  connectionName:{
    type: String
  },
  connectionTopic:{
    type: String
  },
  rsvp:{
    type: String
  }
});

var UserProfileSchema = new mongoose.Schema({
  UserID:{
    type: Number
  },
  UserProfileList: [UserProfileListSchema]

});


module.exports = mongoose.model("user_profiles",UserProfileSchema);
