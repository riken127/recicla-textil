var express = require('express');
var router = express.Router();
var passport = require('passport');

router.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs');
});
router.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/dashboard/users',
    failureRedirect: '/auth/login',
    failureFlash: true
}));

router.delete('/logout', (req, res) => {
    req.logOut();
    res.redirect('/auth/login');
})
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
  
    res.redirect('/auth/login')
  }
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/dashboard/users')
    }
    next()
  }

function checkRoles(roles) {
    return function(req, res, next) {
        if (!req.user || !req.user.roles || !req.user.roles.length) {
            return res.status(403).json({ message: "Access Denied! No roles found for the user." });
        }

        // Check if any of the user's roles match the required roles
        const authorized = roles.some(role => req.user.roles.includes(role));
        if (!authorized) {
            return res.status(403).json({ message: "Access Denied! User does not have the required roles." });
        }

        next(); // Proceed to the next middleware
    };
}
module.exports = {router,
                  checkAuthenticated,
                  checkRoles,
checkNotAuthenticated};