var express = require('express');
var router = express.Router();

/* GET benefactor form page. */
router.get('/', function (req, res, next) {
    res.render('benefactor/form', {title: 'Benefactor Form'});
});

module.exports = router;
