const passport = require('passport');

const isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
        return next()
    }
    return res.status(401).json({"message" : "not authenticated"})
}

module.exports = isLoggedIn;