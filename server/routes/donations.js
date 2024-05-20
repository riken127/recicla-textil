var express = require("express");
var router = express.Router();
var donationController = require("../controllers/DonationController");
var itemsController = require("../controllers/ItemController");
const upload = require("../middleware/multerMiddleware");
const auth = require("../controllers/AuthenticationController");

// Uploads an image for a specific item of a donation
router.post('/:id/upload/', upload.single('item'), itemsController.uploadImage);

/**
 * @swagger
 * tags:
 *   name: Donations
 *   description: Donation management APIs
 */

/**
 * @swagger
 * /donations/all:
 *   get:
 *     summary: Render the table of donations
 *     tags: [Donations]
 *     security:
 *       - JwtCookieAuth: []
 *       - hasRoles: ['administrator', 'employee']
 *     responses:
 *       200:
 *         description: Table of donations rendered successfully
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: HTML content of the donations table page
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
router.get('/all', auth.isAuthenticated, auth.hasRoles(['administrator', 'employee']), donationController.renderDonationsTable);

/**
 * @swagger
 * /donations/{id}:
 *   get:
 *     summary: Retrieve donation information by ID
 *     tags:
 *       - Donations
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the donation to retrieve
 *     responses:
 *       200:
 *         description: Donation information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Donation'
 *       404:
 *         description: Donation not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Donation not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
router.get('/:id', donationController.getDonation);

/**
 * @swagger
 * /donations/all:
 *   post:
 *     summary: Retrieve all donations with DataTables parameters
 *     tags:
 *       - Donations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               draw:
 *                 type: integer
 *                 description: An integer value used by DataTables for its draw counter
 *               start:
 *                 type: integer
 *                 description: Index of the first record to return
 *               length:
 *                 type: integer
 *                 description: Number of records to return
 *               search:
 *                 type: object
 *                 description: Search criteria
 *                 properties:
 *                   value:
 *                     type: string
 *                     description: Search value
 *               order:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     column:
 *                       type: integer
 *                       description: Index of the column to order by
 *                     dir:
 *                       type: string
 *                       enum: [asc, desc]
 *                       description: Sorting direction
 *     responses:
 *       200:
 *         description: Donations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 draw:
 *                   type: integer
 *                   description: An integer value used by DataTables for its draw counter
 *                 recordsTotal:
 *                   type: integer
 *                   description: Total number of records in the dataset
 *                 recordsFiltered:
 *                   type: integer
 *                   description: Number of records after filtering
 *                 data:
 *                   type: array
 *                   description: Array of donation objects
 *                   items:
 *                     $ref: '#/components/schemas/Donation'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: Internal Server Error
 */
router.post("/all", donationController.getAllDonations);

/**
 * @swagger
 * /donations:
 *   post:
 *     summary: Add a new donation
 *     tags:
 *       - Donations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user involved in the activity
 *                 example: 60a53b3478d7e645182c8159
 *               activityType:
 *                 type: string
 *                 enum: ['session', 'donation', 'profile', 'password', 'deletion', 'addition', 'points', 'announcement']
 *                 description: The type of activity
 *                 example: donation
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 description: The timestamp of the activity
 *                 example: 2024-05-15T12:00:00Z
 *               details:
 *                 type: object
 *                 description: Additional details of the activity
 *                 properties:
 *                   benefactorId:
 *                     type: string
 *                     description: The ID of the benefactor
 *                     example: 66341183612bf8d5aff074f0
 *                   pickpointId:
 *                     type: string
 *                     description: The ID of the pickpoint
 *                     example: 663411ad612bf8d5aff0750b
 *                   items:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: []
 *                   totalWeight:
 *                     type: object
 *                     properties:
 *                       value:
 *                         type: number
 *                         description: The total weight of the items
 *                         example: 0
 *                       unit:
 *                         type: string
 *                         description: The unit of the total weight
 *                         example: g
 *                   totalItems:
 *                     type: integer
 *                     description: The total number of items
 *                     example: 0
 *               ip:
 *                 type: string
 *                 description: The IP address associated with the activity
 *                 example: 192.168.0.1
 *     security:
 *       - JwtCookieAuth: []
 *     responses:
 *       200:
 *         description: Donation added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: success
 *                 result:
 *                   type: string
 *                   description: ID of the newly added donation
 *                   example: 609d7cf279e09d0015e42d45
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
router.post("/", auth.isAuthenticated, donationController.addDonation);

/**
 * @swagger
 * /donations/{id}:
 *   delete:
 *     summary: Delete a donation by ID
 *     tags:
 *       - Donations
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the donation to delete
 *     security:
 *       - JwtCookieAuth: []
 *     responses:
 *       200:
 *         description: Donation deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Donation deleted successfully
 *                 type:
 *                   type: string
 *                   example: success
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
router.delete("/:id", auth.isAuthenticated, donationController.deleteDonation);

/**
 * @swagger
 * /donations/{id}:
 *   put:
 *     summary: Update a donation by ID
 *     tags:
 *       - Donations
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the donation to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserActivity'
 *     security:
 *       - JwtCookieAuth: []
 *     responses:
 *       200:
 *         description: Donation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Donation updated successfully
 *                 type:
 *                   type: string
 *                   example: success
 *       404:
 *         description: Donation not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Donation not found
 *                 type:
 *                   type: string
 *                   example: danger
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
router.put("/:id", auth.isAuthenticated, donationController.updateDonation);

/**
 * @swagger
 * tags:
 *   name: Items
 *   description: Items management APIs
 */

/**
 * @swagger
 * /donations/{id}/items:
 *   post:
 *     summary: Add a new item to a specific donation
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the donation to which the item will be added
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the item
 *               description:
 *                 type: string
 *                 description: The description of the item
 *               weight:
 *                 type: object
 *                 properties:
 *                   value:
 *                     type: number
 *                     description: The weight value of the item
 *                   unit:
 *                     type: string
 *                     description: The unit of measurement for the weight
 *               photo:
 *                 type: string
 *                 description: The path to the photo of the item
 *             required:
 *               - name
 *               - weight
 *     responses:
 *       200:
 *         description: Item added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Item added successfully
 *                 donation:
 *                   $ref: '#/components/schemas/UserActivity'
 *                 id:
 *                   type: string
 *                   description: The ID of the added item
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
router.post('/:id/items/', itemsController.addItem);

/**
 * @swagger
 * /donations/{id}/items/{itemId}:
 *   put:
 *     summary: Update an existing item of a specific donation
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the donation containing the item to be updated
 *       - in: path
 *         name: itemId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the item to be updated
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the item
 *               description:
 *                 type: string
 *                 description: The description of the item
 *               weight:
 *                 type: object
 *                 properties:
 *                   value:
 *                     type: number
 *                     description: The weight value of the item
 *                   unit:
 *                     type: string
 *                     description: The unit of measurement for the weight
 *               photo:
 *                 type: string
 *                 description: The path to the photo of the item
 *     responses:
 *       200:
 *         description: Item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserActivity'
 *       404:
 *         description: Donation or Item not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Donation not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
router.put('/:id/items/:itemId', itemsController.updateItem);

/**
 * @swagger
 * /donations/{id}/items/{itemId}:
 *   get:
 *     summary: Retrieve a specific item of a donation by ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the donation containing the item to retrieve
 *       - in: path
 *         name: itemId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the item to retrieve
 *     responses:
 *       200:
 *         description: Item retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserActivity'
 *       404:
 *         description: Donation or Item not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Donation not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
router.get('/:id/items/:itemId', itemsController.getItem);

/**
 * @swagger
 * /donations/{id}/items/{idItem}:
 *   delete:
 *     summary: Delete an item from a specific donation
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the donation containing the item to delete
 *       - in: path
 *         name: idItem
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the item to delete
 *     responses:
 *       200:
 *         description: Item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Item deleted successfully
 *                 type:
 *                   type: string
 *                   example: success
 *       404:
 *         description: Donation or Item not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Donation not found
 *                 type:
 *                   type: string
 *                   example: danger
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 *                 type:
 *                   type: string
 *                   example: danger
 */
router.delete('/:id/items/:idItem', itemsController.deleteItem);

/**
 * @swagger
 * /donations/{id}/items/all:
 *   post:
 *     summary: Retrieve all items for a specific donation
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the donation to retrieve items from
 *       - in: body
 *         name: body
 *         required: true
 *         description: |
 *           The request body must contain DataTables parameters.
 *           See the DataTables documentation for more details: https://datatables.net/manual/server-side
 *         schema:
 *           type: object
 *           properties:
 *             draw:
 *               type: integer
 *               description: The draw counter for DataTables
 *             search[value]:
 *               type: string
 *               description: The search value to apply
 *             order[0][dir]:
 *               type: string
 *               enum: [asc, desc]
 *               description: The order direction
 *             order[0][column]:
 *               type: integer
 *               description: The index of the column to order by
 *     responses:
 *       200:
 *         description: Items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 draw:
 *                   type: integer
 *                   description: The draw counter for DataTables
 *                   example: 1
 *                 recordsTotal:
 *                   type: integer
 *                   description: The total number of records before filtering
 *                   example: 10
 *                 recordsFiltered:
 *                   type: integer
 *                   description: The total number of records after filtering
 *                   example: 5
 *                 data:
 *                   type: array
 *                   description: An array of items for the donation
 *                   items:
 *                     $ref: '#/components/schemas/Item'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */
router.post('/:id/items/all', itemsController.getAllItems);

module.exports = router;
