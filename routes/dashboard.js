var express = require('express');
var router = express.Router();
var dashboardController = require('../controllers/DashboardController');

// the users-data endpoint, this endpoint will be the pillar of the dashboards' information processing
router.get('/users', dashboardController.returnUsersDashboard);

router.get('/benefactors', dashboardController.returnBenefactorsDashboard);

module.exports = router;