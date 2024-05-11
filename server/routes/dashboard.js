var express = require('express');
var router = express.Router();
var dashboardController = require('../controllers/DashboardController');
var auth = require('../controllers/AuthenticationController')
// the users data dashboard, this dashboard will be the pillar of the users information processing.
router.get('/users', auth.isAuthenticated, auth.hasRoles(['administrator']), dashboardController.returnUsersDashboard);
// the benefactors data dashboard, this dashboard will be the pillar of the benefactors information processing
router.get('/benefactors', auth.isAuthenticated, auth.hasRoles(['administrator']), dashboardController.returnBenefactorsDashboard);
// the donations data dashboard, this dashboard will be the pillar of the donation information processing
router.get('/donations', auth.isAuthenticated, auth.hasRoles(['administrator']),dashboardController.returnDonationsDashboard);

module.exports = router;