var express = require('express');
var router = express.Router();
var dashboardController = require('../controllers/DashboardController');
var auth = require('./auth')
// the users data dashboard, this dashboard will be the pillar of the users information processing.
router.get('/users', auth.checkAuthenticated, auth.checkRoles(['administrator']), dashboardController.returnUsersDashboard);
// the benefactors data dashboard, this dashboard will be the pillar of the benefactors information processing
router.get('/benefactors', auth.checkAuthenticated, auth.checkRoles(['administrator']), dashboardController.returnBenefactorsDashboard);

module.exports = router;