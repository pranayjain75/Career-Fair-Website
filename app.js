//setup express to use for routing
var express = require('express');
var app = express();
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//setup mongoose
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

//check mongoose connection
mongoose.connect('mongodb://localhost/career-fair', {useNewUrlParser: true});
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
console.log("We are connected to the DB");
});


//set view engine to ejs
app.set('view engine','ejs');
//set the path to access resources
app.use('/assets', express.static('assets'));

//session handling
var session = require("express-session");
// var cookieParser = require("cookie-parser");
//
// app.use(cookieParser());
app.use(session({ secret: "Assignment 3" }));

//map requests(routes) to controller
var profileController = require('./controller/ProfileController');
var routes = require('./controller/routes');
app.use('/',routes);
app.use("/",profileController);
// app.get("/", function(req,res){
//     res.render("index");
// });
//
// app.get("/contact", function(req,res){
//   res.render("contact");
// });
//
// app.get("/about", function(req,res) {
//   res.render("about");
// });
//
// app.get("/newConnection", function(req,res){
//   res.render("newConnection");
// });
//
// app.get("/connections",function(req,res){
//   res.render("connections");
// });
//
// app.get("/connection",function(req,res){
//   res.render("connection");
// });
//
// app.get("/savedConnections", function(req,res){
//   res.render("savedConnections");
// });

app.listen(8080, function(){
  console.log("listening on port 8080");
});
