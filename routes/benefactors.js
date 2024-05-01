const express = require('express');
const router = express.Router();
const benefactorController = require('../controllers/BenefactorController');
const pickpointController = require('../controllers/PickpointController');
const upload = require('../middleware/multerMiddleware');
const auth = require('./auth')
// Retrieves benefactors table
router.get('/all', auth.checkAuthenticated,benefactorController.renderBenefactorsTable);
// Adds a new benefactor
router.post('/add', benefactorController.addBenefactor);
// Updates an existing benefactor
router.post('/update', benefactorController.updateBenefactor);
// Retrieves a benefactor by its ID.
router.get('/:id', benefactorController.getBenefactor);
// Deletes a benefactor.
router.post('/delete/', benefactorController.deleteBenefactor);
// Retrieves all benefactors
router.post('/all-benefactors', benefactorController.getAllBenefactors);
// Upload benefactor banner
router.post('/upload/banner/', upload.single('banner'), benefactorController.uploadBanner);
// Upload benefactor logo
router.post('/upload/logo', upload.single('logo'), benefactorController.uploadLogo);
// Retrieves all pickpoints table for a certain benefactor
router.get('/:id/pickpoints/all', pickpointController.renderPickpointsTable);
// Adds a new pickpoint to a benefactor
router.post('/:id/pickpoints/add', pickpointController.addPickpoint);
// Upadetes an existing pickpoint of a benefactor
router.post('/:id/pickpoints/:idpp/update', pickpointController.updatePickpoint);
// Retrieves a pickpoint of a benefactor by its ID.
router.get('/:id/pickpoints/:idpp', pickpointController.getPickpoint);
// Deletes a pickpoint of a benefactor.
router.delete('/:id/pickpoints/:idpp/', pickpointController.deletePickpoint);
// Retrieves all pickpoints of a benefactor.
router.post('/:id/pickpoints/all-pickpoints', pickpointController.getAllPickpoints);

module.exports = router;