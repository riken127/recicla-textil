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
  

module.exports = {router,
                  checkAuthenticated,
checkNotAuthenticated};