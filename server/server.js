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
const formatBytes = require('./utils/formatBytes');
const enrichDataFile = require('./utils/enrichDataFile');
const enrichTvShowFile = require('./utils/enrichTvShowFile');

// initialize db
if(db.get('users').value() == null) {
    db.defaults({ users: [ {'username': 'admin', 'password':'admin'} ] }).write();
}

passport.use(new LocalStrategy(
    function(username, password, done) {
        let user = db.get('users').find({ username: username }).value();
        if(user && password === user.password) {
            let authRes = new Object();
            authRes.username = username;
            authRes.isFirstAuth = user.password === 'admin' ? true : false;
            return done(null, authRes);
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

app.disable('x-powered-by');
app.use(session({ secret: config.secret, name : 'macaronSessionId', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
 
// ONLY FOR DEV
// app.use(function (req, res, next) {
//   res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
//   res.setHeader('Access-Control-Allow-Methods', 'POST,DELETE');
//   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
//   res.setHeader('Access-Control-Allow-Credentials', true);
//   next();
// });

// make config file folder accessible as static files when we call /download
app.use('/download', isLoggedIn, express.static(config.filesPath));

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

app.get('/api/config', (req, res) => {
    let configDTO = new Object();
    configDTO.useParseTorrentName = config.useParseTorrentName;
    configDTO.useTmdbApi = config.useTmdbApi;
    res.status(200).json(configDTO);
});

app.post('/api/authenticate', auth(), (req, res) => {
    res.status(200).json(req.user);
});


// must be logged
app.get('/api/logout', isLoggedIn, (req, res) => {
    req.logout();
    res.sendStatus(401);
});

app.get('/api/user', isLoggedIn, (req, res) => {
    res.status(200).json(req.user);
});

app.post('/api/user', isLoggedIn, (req, res) => {
    let user = db.get('users').find({ username: req.user.username }).value();

    if(req.body.username != user.username && req.body.password != user.password) {
        db.get('users').find({ username: req.user.username }).assign({ username: req.body.username, password: req.body.password}).write();
        let updatedUser = db.get('users').find({ username: req.body.username }).value();
        res.status(200).json(updatedUser.username);
    } else {
        res.status(400).json({"message" : "you have to change default username and password"});
    }
});

app.get('/api/files', isLoggedIn, (req, res) => {
    let path = config.filesPath;
    if(req.query.path) path = path + req.query.path + '/';

    if(req.user.isFirstAuth) {
        res.sendStatus(401);
    } else {
        fs.readdir(path, function (err, files) {
            let results = [];
            //handling error
            if (err) {
                console.log('Unable to scan directory: ' + err);
                res.status(500).json({"message" : err});
            } 
            files.forEach(file => {
                let filePath = path + file
                let parsedFile = config.useParseTorrentName ? ptn(file) : new Object();
                if(!config.useParseTorrentName) parsedFile.title = file;
                parsedFile.path = req.query.path ? req.query.path + '/' + file : file;
                parsedFile.originalName = file;
                parsedFile.size = formatBytes(fs.statSync(filePath).size);
                parsedFile.createdDate = fs.statSync(filePath).ctime;
                parsedFile.isDir = fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory();

                results.push(parsedFile);     
            });
            res.status(200).json(results);
        });
    }
});

app.get('/api/files/enrich', isLoggedIn, (req, res) => {
    let fileName = req.query.fileName;
    let year = req.query.year;
    let season = req.query.season;
    let episode = req.query.episode;
    let isMovie = JSON.parse(req.query.isMovie);
    
    if(req.user.isFirstAuth) {
        res.sendStatus(401);
    } else {
        enrichDataFile(fileName, isMovie).then((searchResponse) => {
            let parsedSearchRes = JSON.parse(searchResponse);
            let find = null;
            if(parsedSearchRes.total_results > 0) {
                find = parsedSearchRes.results[0];
                if(year) {
                    let findWithYear = parsedSearchRes.results.find(res => res.release_date && res.release_date.includes(year));
                    findWithYear != null ? find = findWithYear : null;
                }
            }

            if(!isMovie && find && find.id && season && episode) {
                enrichTvShowFile(find.id, season, episode).then((tvShowResponse) => {
                    let parsedTvShowRes = JSON.parse(tvShowResponse);
                    find.overview = parsedTvShowRes.overview;
                    find.vote_average = parsedTvShowRes.vote_average;
                    find.episode_air_date = parsedTvShowRes.air_date;
                    find.episode_name = parsedTvShowRes.name;

                    res.status(200).json(find);
                });
            } else {
                res.status(200).json(find);
            }
        }).catch((error) => {
            console.log(error);
            res.status(500).json(error);
        });
    }
});

app.get('/api/files/download', isLoggedIn, (req, res) => {
    let path;
    if(req.user.isFirstAuth) {
        res.sendStatus(401);
    } else {
        if(req.query.path) path = "download/" + req.query.path;
        if(path) res.status(200).json(path);
    }
});
 
const PORT = config.port || 8081;
 

app.listen(PORT, function () {
  console.log('Macaronbox server is running on port ' + PORT);
});