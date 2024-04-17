var express = require('express');
var router = express.Router();
const benefactorController = require('../controllers/benefactorController');

// benefactor creation form
router.get('/create', benefactorController.renderCreateForm);
// benefactor editing form
router.get('/edit/:id', benefactorController.renderEditForm);
// benefactor table
router.get('/all', benefactorController.renderBenefactorsTable);
// add user via mongoose middleware
router.post('/add', benefactorController.addBenefactor)
// edit user via mongoose middleware
router.post('/edit', benefactorController.updateBenefactor);
// delete user via mongoose middleware
router.post('/delete', benefactorController.deleteBenefactor);

module.exports = router;