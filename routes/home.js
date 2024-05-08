var express = require('express');
var router = express.Router();
var auth = require('./auth')
/* GET home page. */
router.get('/',auth.checkAuthenticated, auth.checkRoles(['employee', 'administrator']), function (req, res, next) {
    res.render('home', {title: 'Home', currentRoute: '/home', username: req.user.username, pfp: req.user.image});
});

module.exports = router;
