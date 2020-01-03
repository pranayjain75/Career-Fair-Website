//express for routing
var express = require('express');
var router = express.Router();
//handling Post requests
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false });
router.use(bodyParser.json());
//Hashing password
var crypto = require('crypto');
const { buildSanitizeFunction } = require('express-validator');
const sanitizeBody = buildSanitizeFunction('body');

//add models
var userModel = require("../models/User");
var userConnection = require("../models/UserConnection");
var userProfileModel = require("../models/UserProfile");

//add util
var connectionDB = require("../utils/connectionDB");
var UserDB = require("../utils/UserDB");

//validation check
const {
  check,
  validationResult
} = require('express-validator/check');


//all routes
router.use(urlencodedParser, async function (req, res, next) {
  //for new connections or login
  if (!req.session.theUser && ((req.query.action === "newConnection") || req.query.action === "login")) {
    var users = await UserDB.getAllUsers();
    var UserProfile = await UserDB.getUserProfile(req.session.theUser.UserID);
    req.session.UserProfile = UserProfile;
  } else if (req.url === "/signIn") {
    res.redirect("/signIn");
  }
  //User already logged in
  else if (req.session.theUser) {
    if (req.query.action === "newConnection") {
      res.redirect("/newConnection");
      return;
    }
    //when action is login or undefined
    else if (req.query.action === "login" || req.query.action === undefined) {
      res.redirect("/login");
      return;
    }
    //adding a new connection
    else if (req.query.action === "save") {
      if (req.session.UserProfile) {
        if (req.body.viewConnections != (JSON.parse(req.query.connection)).connectionId.toString()) {
          res.redirect("/savedConnections");
        }
        else {
          //when rsvp action is yes or no
          if (req.query.rsvp === "Yes" || req.query.rsvp === "No") {
            var connection = JSON.parse(req.query.connection);
            var connectionItem = {
              connectionId: connection.connectionId,
              connectionName: connection.connectionName,
              connectionTopic: connection.connectionTopic,
              rsvp: req.query.rsvp
            };
            var UserProfile = await UserDB.addRSVP(req.session.theUser.UserID, connectionItem);
            req.session.UserProfile = UserProfile;
            res.redirect("/savedConnections");
          }
          else {
            res.redirect("/savedConnections");
          }
        }
      }
    }
    //if delete button is clicked
    else if (req.query.action === "delete") {
      if (req.session.UserProfile) {
        var connection = JSON.parse(req.query.connection);
        if (isValidConnectionID(connection.connectionId.toString())) {
          var UserProfile = await UserDB.deleteConnectionItem(connection.connectionId, req.session.theUser.UserID);
          req.session.UserProfile = UserProfile;
          res.redirect("/savedConnections");
        }
        else {
          res.redirect("/savedConnections");
        }
      }
    }
    //if update button is clicked
    else if (req.query.action === "update") {
      if (isValidConnectionID((JSON.parse(req.query.connection)).connectionId.toString())) {
        var connection = JSON.parse(req.query.connection);
        connection.rsvp = connection.rsvp == "Yes" ? "No" : "Yes";
        var UserProfile = await UserDB.updateRSVP(connection.connectionId, req.session.theUser.UserID, connection.rsvp);
        req.session.UserProfile = UserProfile;
        res.redirect("/savedConnections");
      }
      else {
        resp.redirect("/savedConnections");
      }
    }
    else if (req.query.action === "updateProfile") {
      if (req.session.UserProfile) {
        if (req.query.rsvp === "Yes" || req.query.rsvp === "No") {
          var connection = JSON.parse(req.query.connection);
          var UserProfile = await UserDB.updateRSVP(connection.connectionId, req.session.theUser.UserID, req.query.rsvp);
          req.session.UserProfile = UserProfile;
          res.redirect("/savedConnections");
        }
        else {
          res.redirect("/savedConnections");
        }
      }
    }
    //user logs out
    else if (req.query.action === "logout") {
      if (req.session.theUser) {
        req.session.theUser = null;
      }
      if(req.session.UserProfile){
        req.session.UserProfile = null;
      }
      res.redirect("/");
    }
  }

  next();
});


function isValidConnectionID(connectionId) {
  if (connectionId != "") {
    if (connectionId.length > 0) {
      if (!isNaN(connectionId)) {
        return true;
      }
      else {
        return false;
      }
    }
    else {
      return false;
    }
  }
  else {
    return false;
  }
}

module.exports = router;
