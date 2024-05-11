var express = require('express');
var router = express.Router();
var authController = require('../controllers/AuthenticationController');
router.get('/login', authController.isNotAuthenticated, (req, res) => {
    res.render('login.ejs');
});
router.post('/login', authController.isNotAuthenticated, authController.validateLogin);

router.post('/logout', authController.logout)

module.exports = router;


