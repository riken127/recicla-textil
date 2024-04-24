var express = require('express');
var router = express.Router();
var dashboardController = require('../controllers/DashboardController');

// the users data dashboard, this dashboard will be the pillar of the users information processing.
router.get('/users', dashboardController.returnUsersDashboard);
// the benefactors data dashboard, this dashboard will be the pillar of the benefactors information processing
router.get('/benefactors', dashboardController.returnBenefactorsDashboard);

module.exports = router;