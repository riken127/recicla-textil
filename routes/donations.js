var express = require("express");
var router = express.Router();
var donationController = require("../controllers/DonationController");
var itemsController = require("../controllers/ItemController");
const upload = require("../middleware/multerMiddleware");
const benefactorController = require("../controllers/BenefactorController");

router.get("/all", donationController.renderDonationsTable);
router.get("/:id", donationController.getDonation);
router.post("/all-donations", donationController.getAllDonations);
router.post("/add", donationController.addDonation);
router.post("/delete", donationController.deleteDonation);
router.post("/update", donationController.updateDonation);

router.get('/:id/items/all', itemsController.renderItemsTable);
router.post('/:id/items/add', itemsController.addItem);
router.post('/:id/items/:itemId/update', itemsController.updateItem);
router.get('/:id/items/:itemId', itemsController.getItem);
router.delete('/:id/items/:idItem/delete', itemsController.deleteItem);
router.post('/:id/items/all-items', itemsController.getAllItems);

router.post('/:id/upload/', upload.single('item'), itemsController.uploadImage);
// route exportation
module.exports = router;
