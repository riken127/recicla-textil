const express = require('express');
const router = express.Router();
const benefactorController = require('../controllers/BenefactorController');
const pickpointController =  require('../controllers/PickpointController');

router.get('/all', benefactorController.renderBenefactorsTable);
router.post('/add', benefactorController.addBenefactor);
router.post('/update', benefactorController.updateBenefactor);
router.get('/:id', benefactorController.getBenefactor);
router.post('/delete/', benefactorController.deleteBenefactor);
router.post('/all-benefactors', benefactorController.getAllBenefactors);

router.get('/:id/pickpoints/all', pickpointController.renderPickpointsTable);
router.post('/:id/pickpoints/add', pickpointController.addPickpoint);
router.post('/:id/pickpoints/:idpp/update', pickpointController.updatePickpoint);
router.get('/:id/pickpoints/:idpp', pickpointController.getPickpoint);
router.delete('/:id/pickpoints/:idpp/delete', pickpointController.deletePickpoint);
router.post('/:id/pickpoints/all-pickpoints', pickpointController.getAllPickpoints);

module.exports = router;
