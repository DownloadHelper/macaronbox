const config = require('./config');
const path = require('path');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
var fs = require('fs');
const Cryptr = require("cryptr");
const cryptr = new Cryptr(config.secretDb);
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('./db.json', {
    serialize: (data) => cryptr.encrypt(JSON.stringify(data)),
    deserialize: (data) => JSON.parse(cryptr.decrypt(data))
  });
const db = low(adapter);
const passport = require('passport');
const ptn = require('parse-torrent-name');
const LocalStrategy = require('passport-local').Strategy;
const auth = require('./middleware/authMiddleware');
const isLoggedIn = require('./middleware/isLoggedInMiddleware');

// initialize db
if(db.get('users').value() == null) {
    db.defaults({ users: [ {'username': 'admin', 'password':'admin'} ] }).write();
}

passport.use(new LocalStrategy(
    function(username, password, done) {
        let user = db.get('users').find({ username: username }).value();
        if(user && password === user.password) {
            return done(null, username);
        } else {
            return done("unauthorized access", false);
        }
    }
));

passport.serializeUser(function(user, done) {
    if(user) done(null, user);
});
  
passport.deserializeUser(function(id, done) {
    done(null, id);
});

app.use(session({ secret: config.secret, resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
 
app.use(function (req, res, next) {
//   res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});
 
// make client folder accessible as static files when we call /
app.use('/', express.static('client'));
app.get('/login', function(req,res) {  
    res.sendFile(path.join(__dirname+'/client/index.html'));
});
app.get('/home', function(req,res) {  
    res.sendFile(path.join(__dirname+'/client/index.html'));
});

app.get('/api', function (req, res) {
  res.end('macaronbox api');
});


app.post('/api/authenticate', auth(), (req, res) => {
    res.status(200).json({"user" : req.user});
});

app.get('/api/user', isLoggedIn, (req, res) => {
    res.status(200).json({"user" : req.user});
});

app.get('/api/files', isLoggedIn, (req, res) => {
    let path = config.filesPath;
    if(req.query.path) path = path + req.query.path + '/';

    fs.readdir(path, function (err, files) {
        let results = [];
        //handling error
        if (err) {
            console.log('Unable to scan directory: ' + err);
            res.status(500).json({"message" : err});
        } 
        files.forEach(file => {
            let filePath = path + file
            let parsedFile = ptn(file);
            parsedFile.path = req.query.path ? req.query.path + '/' + file : file;
            parsedFile.originalName = file;
            parsedFile.size = fs.statSync(filePath).size;
            parsedFile.createdDate = fs.statSync(filePath).ctime;
            parsedFile.isDir = fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory();
            results.push(parsedFile);
        });
        res.status(200).json(results);
    });
});

app.get('/api/files/download/:fileName', isLoggedIn, (req, res) => {
    let fileName = req.params.fileName;
    if(fileName) res.download(config.filesPath + fileName);
});
 
const PORT = config.port || 8081;
 

app.listen(PORT, function () {
  console.log('Macaronbox server is running on port ' + PORT);
});