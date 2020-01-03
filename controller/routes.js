//express for routing
var express = require('express');
var router = express.Router();
//Hashing password
var crypto = require('crypto');
//Adding utils
var connDB = require("../utils/connectionDB.js");
var UserDB = require("../utils/UserDB");
//Handling POST requests
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var User = require("../models/User");

const { check, param, validationResult } = require('express-validator/check')


//index page
router.all('/', function (req, res) {
  res.render('index');
});
//contact page
router.get('/contact', function (req, res) {
  res.render('contact');
});
//about page
router.get('/about', function (req, res) {
  res.render('about');
});
//connection page
router.get("/connection", async function (req, res) {
  if (Object.keys(req.query).length > 0) {
    if (req.query.connectionId.length == 1) {
      if (!isNaN(req.query.connectionId)) {
        var connection = await connDB.getConnection(req.query.connectionId);
        res.render("connection", { connection: connection, action: "" });
      }
      else {
        res.redirect("/connections");
      }
    }
    else {
      res.redirect("/connections");
    }
  }
  else {
    res.redirect("/connections");
  }
});
//post request for connection
router.post("/connection", urlencodedParser, async function (req, res) {
  if (Object.keys(req.query).length > 0) {
    if (req.query.action === "update") {
      if (req.query.connectionId != "") {
        if (req.query.connectionId.length >= 1) {
          if (!isNaN(req.query.connectionId)) {
            var connection = await connDB.getConnection(req.query.connectionId);
            res.render("connection", { connection: connection, action: "update" });
          }
        }
      }
      else {
        res.redirect("/connections");
      }
    }
    else {
      res.redirect("/connections");
    }
  }
  else {
    res.redirect("/connections");
  }
});
//connections page
router.get("/connections", async function (req, res) {
  if (req.session.theUser) {
    var connections = await connDB.getConnections();
    var catTopic = [];
    for (i = 0; i < connections.length; i++) {
      if (catTopic.indexOf(connections[i].connectionTopic) === -1) {
        catTopic.push(connections[i].connectionTopic);
      }
    }
    res.render("connections", { connections: connections, categories: catTopic,UserID: req.session.theUser ? req.session.theUser.UserID: '' });
  }
  else {
    res.redirect("/");
  }

});
//savedConnections page
router.get("/savedConnections", function (req, res) {
  res.render("savedConnections", { "savedConnection": ((req.session.UserProfile) ? req.session.UserProfile.UserProfileList : []) });
});
//newConnection page
router.get("/newConnection", function (req, res) {
  if (!req.session.theUser) {
    res.redirect("/signIn");
  } else {
    var errorMessage = req.session.errorMessage;
    req.session.errorMessage = null;
    var data = {
      title: 'New Connection',
      path: req.url,
      errorMessage: errorMessage
        };
    res.render("newConnection", { data: data });
  }
});
//When user clicks on create connection
router.post('/newConnection', [
  check('name').isLength({ min: 5 }).withMessage('Enter the name correctly'),
  check('topic').isLength({ min: 3 }).withMessage('Enter the topic correctly'),
  check('details').isLength({ min: 1 }).withMessage('Enter the details correctly'),
  check('date').isLength({ min: 1 }).withMessage('Enter the valid time')
], async function (req, res) {
  const errors = validationResult(req);
  if (errors.array().length > 0) {
    req.session.errorMessage = errors.array();
    res.redirect("newConnection");
}else{
    var connection = {
      connectionName: req.body.name,
      connectionTopic: req.body.topic,
      connectionLocation: req.body.location,
      connectionTime: req.body.date,
      connectionDetails: req.body.details,
      UserID: (req.session.theUser?req.session.theUser.UserID:"")
    };
    var newConnection = await connDB.addNewConnection(connection);
    res.redirect("/connections");
  }
});
//when sign up link is linked
router.get('/registration_page', function(req,res){
  var errorMessage = req.session.errorMessage;
    req.session.errorMessage = null;
    if (req.session.theUser) {
        console.log('User already logged in');
        res.redirect('/');
    }else{
      var data = {
          title: 'Register',
          path: req.url,
          errorMessage: errorMessage
      };
      res.render('register', {
          data: data
      });
  }
});
//signUp
router.post('/register',[
  check('email').isEmail().normalizeEmail().withMessage('Improper Email Id'),
  check('password').not().isEmpty().trim().escape().isLength({ min: 5 }).withMessage('Improper Password'),
  check('firstName').isLength({min : 3}).withMessage('First Name must be more than 3 characters'),
  check('firstName').isAlpha().withMessage('First Name should be only alphabets'),
  check('lastName').isLength(({min : 3})).withMessage('Last Name must be more than 3 characters'),
  check('lastName').isAlpha().withMessage('Last Name should be only alphabets'),
  check('confirmPassword').not().isEmpty().trim().escape().isLength({ min: 5 }).withMessage('Improper Confirm Password'),
  check('confirmPassword', 'Password Confirmation field must have the same value as the password field').exists().custom((value, { req }) => value === req.body.password),
  check('email', 'Email Id already registered').exists().custom( async (value, { req }) => {
      var user = await UserDB.getUserByEmail(value);
      if(user===null)
          return true;
      else
          return false;
  }),
] , async function(req,res){
  const errors = validationResult(req);
  if (errors.array().length>0){
    req.session.errorMessage = errors.array();
    res.redirect('/registration_page');
  }else{
    if (req.session.theUser) {
      console.log('User already logged in');
      res.redirect('/');
  }else{
    var users = await UserDB.getAllUsers();
    var userId = 1;
    if(users.length>0){
      userId = users[users.length-1].UserID + 1
    }
    var userObject = {
      UserID: userId,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
  };
  var userModelObject = new User(userObject);
  userModelObject.password = userModelObject.verifyPassword(userObject.password,userObject.email,true);
  var user = await userDB.createNewUser(userModelObject);
  if(user != null){
    req.session.theUser = user;
    req.session.UserProfile = await userDB.getUserProfile(user.UserID);
    res.redirect('/savedConnections');
  }
  }
  }
});

//login
router.get('/signIn', function (req, res) {
  var errorMessage = req.session.errorMessage;
  req.session.errorMessage = null;
  if (req.session.theUser) {
    console.log('User already logged in');
    res.redirect('/');
  } else {
    var data = {
      title: 'Sign In',
      path: req.url,
      errorMessage: errorMessage
    };
    res.render('login', { data: data });
  }
});
//After clicking login
router.post("/login", urlencodedParser, [
  check('username').isEmail().normalizeEmail().withMessage('Please enter correct Username'),
  check('password').not().isEmpty().trim().escape().isLength({ min: 5 }).withMessage('Please enter correct password')
], async function (req, res) {
  if (req.session.theUser) {
    console.log('User already logged in');
    res.redirect('/');
  } else {
    var username = req.body.username;
    var password = req.body.password;
    var user = await UserDB.getUserByEmail(username);
    if (user != null && user.verifyPassword(password,username,false)) {
      //password matches, proceed further
      req.session.theUser = user;
      req.session.UserProfile = await UserDB.getUserProfile(user.UserID);
      res.redirect('/savedConnections');
    } else {
      //password did not match
      var errorMessage = "Either username or password are incorrect. Please try again.";
      req.session.errorMessage = errorMessage;
      res.redirect('/signIn');
    }
  }
});
//update button on connections page
router.post("/editConnection", urlencodedParser,async function(req,res){
    if(req.query.action=== "connectionUpdate"){
      connDataToUpdate=JSON.parse(req.query.item);
      res.render('editConnection', {data: connDataToUpdate,errorData:""});
    }
    else if(req.query.action=== "connectionDelete"){
      var connID=JSON.parse(req.query.connectionId);
      if(await connDB.deleteUserConnection(connID)){
        var dataForDelete = await UserDB.findConnectionForDelete(connID);
        if(dataForDelete !== null){
           if(await UserDB.deleteConnectionForUser(connID)){
             res.redirect("/connections");
           }
        }
        else{
          res.redirect("/connections");
        }
      }
    }
});
//When update Connection button is clicked
router.post("/updateUserConnection", urlencodedParser,[
  check('name','Invalid Connection name').isLength({min:1}),
  check('topic','Invalid Connection topic').isLength({min:1}),
  check('detail','Invalid Connection detail').isLength({min:1}),
  check('location','Invalid connection location').isLength({min:1}),
  check('time','Invalid connection time').isLength({min:1})
],async function(req, res){
  const errors = validationResult(req);
  if(!errors.isEmpty())
  {
  res.render("editConnection",{errorData:errors.mapped(),data:""});
  }
  else{
    var connection = {connectionId:req.body.connectionId,connectionName:req.body.name,connectionTopic:req.body.topic,connectionDetails:req.body.detail,connectionLocation:req.body.location,connectionTime:req.body.time};
    if(await connDB.updateUserConnection(connection)){
      res.redirect("/connections");
    }
    else{
      res.redirect("/newConnection");
    }
  }
});

module.exports = router;
