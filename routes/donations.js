var express = require('express');
var router = express.Router();
var donationController = require('../controllers/DonationController');

// the main page, that contains the datatables' plugin, and all the modals'.
router.get('/all', donationController.renderDonationsTable);
// get user information via get, sends a request to which is than rendered in frontend via ajax.
router.get('/:id', donationController.getDonation)
// get all users by json (server-side processing route, connects with ajax's create table in frontend)
router.post('/all-donations', donationController.getAllDonations);
// add user via mongoose middleware, sends mongoose object via POSTs' body via create modals' form
router.post('/add', donationController.addDonation)
// delete user via mongoose middleware, sends mongoose object via post's body.
router.post('/delete', donationController.deleteDonation);

// route exportation
module.exports = router;
