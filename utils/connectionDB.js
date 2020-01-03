var mongoose = require("mongoose");
var connection = require('../models/connection');
var Connection = require('mongoose').model('connections');
var connectionDB = {};

connectionDB.getConnections = function () {
    return new Promise((resolve, reject) =>{
        connection.find({}).then(function(connection) {
            resolve(connection);
        }).catch(function(err) {
            console.log("Error:", err);
            return reject(err);
        });
    })
};

connectionDB.getConnection = function (connectionID) {
    return new Promise((resolve, reject) =>{
        connection.findOne({connectionId: connectionID}).then(function(connections) {
            resolve(connections);
        }).catch(function(err) {
            console.log("Error:", err);
            return reject(err);
        });
    })
};

connectionDB.addNewConnection = function(connection){
  return new Promise((resolve, reject) =>{
    connectionDB.getConnections().then(function(connections){
      connection.connectionId = connections.length + 1;
      var newConnection = new Connection(connection);
      newConnection.save().then(function(data) {
        resolve(data);
      }).catch(function(err) {
          console.log("Error:", err);
          return reject(err);
      });
    });
  });
}

connectionDB.updateUserConnection = async function(connectionData){
  return new Promise((resolve, reject) =>{
  connection.findOneAndUpdate({ 'connectionId':  connectionData.connectionId },
  { $set: {connectionName: connectionData.connectionName, connectionTopic: connectionData.connectionTopic, connectionDetails: connectionData.connectionDetails, connectionLocation: connectionData.connectionLocation,
             connectionTime: connectionData.connectionTime} },
             { upsert: true}, function (err, data) {
               resolve(data);
             }).catch(err =>{
               console.log(err);
               return reject(err);
             });
  });
}

connectionDB.deleteUserConnection = function(connectionId){
  return new Promise((resolve, reject) =>{
    connection.deleteOne({"connectionId": connectionId }).then(()=>{
      resolve(true);
    }).catch((err)=>{
      return reject(err);
    });
  });
};



module.exports = connectionDB;
