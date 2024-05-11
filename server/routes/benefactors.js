const express = require('express');
const router = express.Router();
const benefactorController = require('../controllers/BenefactorController');
const pickpointController = require('../controllers/PickpointController');
const upload = require('../middleware/multerMiddleware');
const auth = require('../controllers/AuthenticationController')
// Retrieves benefactors table
router.get('/all', auth.isAuthenticated, auth.hasRoles(['administrator']), benefactorController.renderBenefactorsTable);
// Upload benefactor banner
router.post('/upload/banner/', upload.single('banner'), benefactorController.uploadBanner);
// Upload benefactor logo
router.post('/upload/logo', upload.single('logo'), benefactorController.uploadLogo);

// Adds a new benefactor
router.post('/', benefactorController.addBenefactor);
// Updates an existing benefactor
router.put('/:id', benefactorController.updateBenefactor);
// Retrieves a benefactor by its ID.
router.get('/:id', benefactorController.getBenefactor);
// Deletes a benefactor.
router.delete('/:id', benefactorController.deleteBenefactor);
// Retrieves all benefactors
router.post('/all', benefactorController.getAllBenefactors);

// Adds a new pickpoint to a benefactor
router.post('/:id/pickpoints/', pickpointController.addPickpoint);
// Upadetes an existing pickpoint of a benefactor
router.put('/:id/pickpoints/:idpp', pickpointController.updatePickpoint);
// Retrieves a pickpoint of a benefactor by its ID.
router.get('/:id/pickpoints/:idpp', pickpointController.getPickpoint);
// Deletes a pickpoint of a benefactor.
router.delete('/:id/pickpoints/:idpp', pickpointController.deletePickpoint);
// Retrieves all pickpoints of a benefactor.
router.post('/:id/pickpoints/all', pickpointController.getAllPickpoints);

module.exports = router;