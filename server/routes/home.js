var express = require('express');
var router = express.Router();
var auth = require('../controllers/AuthenticationController');
/* GET home page. */
router.get('/', auth.isAuthenticated, auth.hasRoles(['employee', 'administrator']), function (req, res, next) {
    res.render('home', {title: 'Home', currentRoute: '/home', username: req.user.username, pfp: req.user.image});
});

module.exports = router;
