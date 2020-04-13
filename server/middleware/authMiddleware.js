const passport = require('passport');

const auth = () => {
    return (req, res, next) => {
        passport.authenticate('local', (error, user, info) => {
            if(info && info.message === 'Missing credentials') res.status(400).json({"message" : info.message});
            if(error) res.status(401).json({"message" : error});
            req.login(user, function(error) {
                if (error) return next(error);
                next();
            });
        })(req, res, next);
    }
}

module.exports = auth;