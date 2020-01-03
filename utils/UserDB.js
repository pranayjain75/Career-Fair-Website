var mongoose = require("mongoose");
var User = require('../models/User');
var UserProfile = require('../models/UserProfile.js');
var connectionDB = require('../utils/connectionDB');
var userConnection = require('../models/UserConnection');



userDB = {};

userDB.createNewUser = function(userObj){
    return new Promise((resolve, reject)=>{
        userObj.save().then(function(user){
            var userProfile = new UserProfile({UserID:user.UserID});
            userProfile.save().then(function(userProfile){
                resolve(user);
            }).catch(function(err){
                console.log("Error:", err);
                return reject(err);
            })
        }).catch(function(err){
            console.log("Error:", err);
            return reject(err);
        });
    });
};

userDB.getAllUsers = function () {
    return new Promise((resolve, reject) =>{
        User.find({}).then(function(users) {
            resolve(users);
        }).catch(function(err) {
            console.log("Error:", err);
            return reject(err);
        });
    })
};

userDB.getUser =  function (userId) {
    return new Promise((resolve, reject) =>{
        User.findOne({UserID: userId}).then(function(user) {
            resolve(user);
        }).catch(function(err) {
            console.log("Error:", err);
            return reject(err);
        });
    })
};

userDB.getUserByEmail =  function (email) {
    return new Promise((resolve, reject) =>{
        User.findOne({email: email}).then(function(user) {
            resolve(user);
        }).catch(function(err) {
            console.log("Error:", err);
            return reject(err);
        });
    })
};

userDB.getUserProfile = function (userId) {
    return new Promise((resolve, reject) =>{
        UserProfile.findOne({UserID: userId}).then(function(userProfile) {
            resolve(userProfile);
        }).catch(function(err) {
            console.log("Error:", err);
            return reject(err);
        });
    })
};

userDB.addRSVP = function(userId,userConnection){
    return new Promise((resolve, reject) =>{
        var count = 0;
        UserProfile.findOne({UserID: userId}).then(function(userProfile) {
            for (let index = 0; index < userProfile.UserProfileList.length; index++) {
                if(userConnection.connectionId==userProfile.UserProfileList[index].connectionId){
                    userProfile.UserProfileList[index].rsvp = userConnection.rsvp;
                    count++;
                }
            }
            if(count==0){
                userProfile.UserProfileList.push(userConnection);
            }
            userProfile.save();
            resolve(userProfile);
        }).catch(function(err) {
            console.log("Error:", err);
            return reject(err);
        });
    });
};

userDB.updateRSVP = function (connectionID, userId, rsvp){
    return new Promise((resolve, reject) =>{
        UserProfile.findOne({UserID: userId}).then(function(userProfile) {
            for (let index = 0; index < userProfile.UserProfileList.length; index++) {
                if(connectionID==userProfile.UserProfileList[index].connectionId){
                    userProfile.UserProfileList[index].rsvp = rsvp;
                }
            }
            userProfile.save();
            resolve(userProfile);
        }).catch(function(err) {
            console.log("Error:", err);
            return reject(err);
        });
    })
};

userDB.deleteConnectionItem = function(connectionId, userId){
    return new Promise((resolve, reject) =>{
        UserProfile.findOne({UserID: userId}).then(function(userProfile) {
            for (let index = 0; index < userProfile.UserProfileList.length; index++) {
                if(connectionId==userProfile.UserProfileList[index].connectionId){
                    userProfile.UserProfileList.splice(index, 1);
                }
            }
            userProfile.save();
            resolve(userProfile);
        }).catch(function(err) {
            console.log("Error:", err);
            return reject(err);
        });
    })
};

userDB.findConnectionForDelete =  function(ConnectionID){
  return userConnection.userConnectionModel.findOne({"connection.connectionId": ConnectionID});
}

userDB.deleteConnectionForUser = function(ConnectionID){
  return new Promise((resolve, reject) =>{
    userConnection.userConnectionModel.deleteMany({"connection.connectionId": ConnectionID}).then(()=>{
      resolve(true);
    }).catch((err)=>{
      return reject(err);
    });
  });
}



module.exports = userDB;
