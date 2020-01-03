var mongoose = require('mongoose');
var crypto = require("crypto");
var userSchema = new mongoose.Schema({
  UserID: {
    type: Number,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
    password: {
      type: String,
      trim: true
    }
});


userSchema.methods.verifyPassword = function( password, salt, hashYN){
  // Hashing user's salt and password with 1000 iterations, 64 length and sha512 digest
  this.hash = crypto.pbkdf2Sync(password, salt,
  1000, 64, `sha512`).toString(`hex`);
  if(hashYN){
    return this.hash;
  }
  else{
    return this.password === this.hash;;
  }
}

var UserModel = mongoose.model('users',userSchema);

module.exports = UserModel;






















// var User = function(UserID, firstName, lastName, email){
// var UserModel = {UserID:UserID, firstName:firstName, lastName:lastName, email:email};
//     return UserModel;
// };
//
// module.exports.User = User;
