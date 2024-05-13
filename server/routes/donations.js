var express = require("express");
var router = express.Router();
var donationController = require("../controllers/DonationController");
var itemsController = require("../controllers/ItemController");
const upload = require("../middleware/multerMiddleware");
const auth = require("../controllers/AuthenticationController");

// Renders the donations table (all donations) - Only administrators and employees can access
router.get("/all", auth.isAuthenticated, auth.hasRoles(['administrator', 'employee']), donationController.renderDonationsTable);

// Gets a donation by ID
router.get("/:id", donationController.getDonation);
// Gets all donations
router.post("/all", donationController.getAllDonations);
// Adds a new donation
router.post("/", donationController.addDonation);
// Deletes a donation
router.delete("/:id", donationController.deleteDonation);
// Updates an existing donation
router.put("/:id", donationController.updateDonation);

// Renders the items table of a specific donation
router.get('/:id/items/all', itemsController.renderItemsTable);
// Uploads an image for a specific item of a donation
router.post('/:id/upload/', upload.single('item'), itemsController.uploadImage);

// Adds a new item to a specific donation
router.post('/:id/items/add', itemsController.addItem);
// Updates an existing item of a specific donation
router.post('/:id/items/:itemId/update', itemsController.updateItem);
// Gets a specific item of a donation by ID
router.get('/:id/items/:itemId', itemsController.getItem);
// Deletes an item of a specific donation
router.delete('/:id/items/:idItem/delete', itemsController.deleteItem);
// Gets all items of all donations
router.post('/:id/items/all-items', itemsController.getAllItems);

module.exports = router;
