const express = require("express");
const router = express.Router();
const benefactorController = require("../controllers/BenefactorController");
const pickpointController = require("../controllers/PickpointController");
const postController = require("../controllers/PostsController");
const linkController = require("../controllers/LinkController");
const upload = require("../middleware/multerMiddleware");
const auth = require("../controllers/AuthenticationController");

// Upload benefactor banner
router.post(
    "/upload/banner/",
    upload.single("banner"),
    benefactorController.uploadBanner
);
// Upload benefactor logo
router.post(
    "/upload/logo",
    upload.single("logo"),
    benefactorController.uploadLogo
);

// Upload benefactor post image
router.post(
    "/upload/image",
    upload.single("image"),
    postController.uploadImage
);

/**
 * @swagger
 * tags:
 *   name: Benefactors
 *   description: Benefactors management APIs
 */

/**
 * @swagger
 * '/benefactors/all':
 *   get:
 *     tags: [Benefactors]
 *     summary: Render benefactors table for administrators
 *     security:
 *       - JwtCookieAuth: []
 *     responses:
 *       200:
 *         description: Rendered benefactors table
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: HTML content of the benefactors table
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get(
    "/all",
    auth.isAuthenticated,
    auth.hasRoles(["administrator"]),
    benefactorController.renderBenefactorsTable
);

/**
 * @swagger
 * '/benefactors/':
 *   post:
 *     tags: [Benefactors]
 *     summary: Add a new benefactor
 *     security:
 *       - JwtCookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *                 $ref: '#/components/schemas/Benefactor'
 *     responses:
 *       200:
 *         description: New benefactor added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Benefactor added successfully.
 *                 type:
 *                   type: string
 *                   example: success
 *                 result:
 *                   type: string
 *                   description: The ID of the newly added benefactor
 *       400:
 *         description: Username, email, or phone number already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Username already exists.
 *                 type:
 *                   type: string
 *                   example: danger
 *       500:
 *         description: Failed to add benefactor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to add benefactor.
 *                 type:
 *                   type: string
 *                   example: danger
 */
router.post("/", benefactorController.addBenefactor);

/**
 * @swagger
 * '/benefactors/{id}':
 *   put:
 *     tags: [Benefactors]
 *     summary: Update an existing benefactor
 *     security:
 *       - JwtCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The benefactor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Benefactor'
 *     responses:
 *       200:
 *         description: Benefactor updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Benefactor updated successfully.
 *                 type:
 *                   type: string
 *                   example: success
 *       400:
 *         description: Username, email, or phone number already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Username already exists.
 *                 type:
 *                   type: string
 *                   example: danger
 *       500:
 *         description: Failed to update benefactor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to update benefactor.
 *                 type:
 *                   type: string
 *                   example: danger
 */
router.put("/:id", auth.isAuthenticated, benefactorController.updateBenefactor);

/**
 * @swagger
 * '/benefactors/{id}':
 *   put:
 *     tags: [Benefactors]
 *     summary: Update an existing benefactor
 *     security:
 *       - JwtCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The benefactor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               logo:
 *                 type: string
 *               banner:
 *                 type: string
 *               description:
 *                 type: string
 *               address:
 *                 type: object
 *               phone:
 *                 type: string
 *               pickpoints:
 *                 type: number
 *               convertationRatio:
 *                 type: number
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Benefactor updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Benefactor updated successfully.
 *                 type:
 *                   type: string
 *                   example: success
 *       400:
 *         description: Username, email, or phone number already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Username already exists.
 *                 type:
 *                   type: string
 *                   example: danger
 *       500:
 *         description: Failed to update benefactor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to update benefactor.
 *                 type:
 *                   type: string
 *                   example: danger
 */
router.put("/:id", auth.isAuthenticated, benefactorController.updateBenefactor);

/**
 * @swagger
 * '/benefactors/{id}':
 *   get:
 *     tags: [Benefactors]
 *     summary: Retrieve a benefactor by ID
 *     security:
 *       - JwtCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The benefactor ID
 *     responses:
 *       200:
 *         description: Benefactor retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Benefactor'
 *       404:
 *         description: Benefactor not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Benefactor not found
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
router.get("/:id", auth.isAuthenticated, benefactorController.getBenefactor);

/**
 * @swagger
 * /benefactors/{id}:
 *   delete:
 *     tags: [Benefactors]
 *     summary: Delete a benefactor by ID
 *     security:
 *       - JwtCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The benefactor ID
 *     responses:
 *       200:
 *         description: Benefactor deleted successfully or status updated to inactive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Benefactor deleted successfully
 *                 type:
 *                   type: string
 *                   example: success
 *       404:
 *         description: Benefactor not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Benefactor not found
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
router.delete(
    "/:id",
    auth.isAuthenticated,
    benefactorController.deleteBenefactor
);

/**
 * @swagger
 * /benefactors/all:
 *   post:
 *     tags: [Benefactors]
 *     summary: Retrieve all benefactors
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: Filter benefactors by status (optional)
 *     responses:
 *       200:
 *         description: Benefactors retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 draw:
 *                   type: integer
 *                   description: Sequence number for the DataTables request
 *                   example: 1
 *                 recordsTotal:
 *                   type: integer
 *                   description: Total number of records in the data set
 *                   example: 100
 *                 recordsFiltered:
 *                   type: integer
 *                   description: Number of records after filtering
 *                   example: 50
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Benefactor'
 *                   description: Array of benefactors data
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
router.post(
    "/all",
    auth.isAuthenticated,
    benefactorController.getAllBenefactors
);

/**
 * @swagger
 * tags:
 *   name: Pickpoints
 *   description: Pickpoints management APIs
 */

/**
 * @swagger
 * /benefactors/{id}/pickpoints:
 *   post:
 *     tags: [Pickpoints]
 *     summary: Add a new pickpoint to a benefactor
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The benefactor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               latitude:
 *                 type: number
 *                 description: Latitude of the pickpoint
 *                 example: 123.456
 *               longitude:
 *                 type: number
 *                 description: Longitude of the pickpoint
 *                 example: 78.910
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                     description: Street address
 *                     example: 123 Main St
 *                   city:
 *                     type: string
 *                     description: City
 *                     example: New York
 *                   state:
 *                     type: string
 *                     description: State
 *                     example: NY
 *                   postalCode:
 *                     type: string
 *                     description: Postal code
 *                     example: 10001
 *               name:
 *                 type: string
 *                 description: Name of the pickpoint
 *                 example: Pickpoint A
 *     responses:
 *       200:
 *         description: Pickpoint added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Pickpoint added successfully
 *                 benefactor:
 *                   $ref: '#/components/schemas/Benefactor'
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
router.post("/:id/pickpoints/", auth.isAuthenticated, pickpointController.addPickpoint);

/**
 * @swagger
 * /benefactors/{id}/pickpoints/{idpp}:
 *   put:
 *     summary: Update an existing pickpoint of a benefactor
 *     tags:
 *       - Pickpoints
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The benefactor ID
 *       - in: path
 *         name: idpp
 *         schema:
 *           type: string
 *         required: true
 *         description: The pickpoint ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               street:
 *                 type: string
 *                 description: Street address
 *                 example: 123 Main St
 *               city:
 *                 type: string
 *                 description: City
 *                 example: New York
 *               state:
 *                 type: string
 *                 description: State
 *                 example: NY
 *               postalCode:
 *                 type: string
 *                 description: Postal code
 *                 example: 10001
 *               name:
 *                 type: string
 *                 description: Name of the pickpoint
 *                 example: Pickpoint A
 *     responses:
 *       200:
 *         description: Pickpoint updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Pickpoint updated successfully
 *                 benefactor:
 *                   $ref: '#/components/schemas/Benefactor'
 *       404:
 *         description: Benefactor or pickpoint not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Benefactor not found
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
router.put("/:id/pickpoints/:idpp", pickpointController.updatePickpoint);
/**
 * @swagger
 * /benefactors/{id}/pickpoints/{idpp}:
 *   get:
 *     summary: Retrieve a pickpoint of a benefactor by its ID
 *     tags:
 *       - Pickpoints
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The benefactor ID
 *       - in: path
 *         name: idpp
 *         schema:
 *           type: string
 *         required: true
 *         description: The pickpoint ID
 *     responses:
 *       200:
 *         description: Pickpoint retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pickpoint'
 *       404:
 *         description: Benefactor or pickpoint not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Benefactor not found
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
router.get("/:id/pickpoints/:idpp", auth.isAuthenticated, pickpointController.getPickpoint);

/**
 * @swagger
 * /benefactors/{id}/pickpoints/{idpp}:
 *   delete:
 *     summary: Delete a pickpoint of a benefactor
 *     tags:
 *       - Pickpoints
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The benefactor ID
 *       - in: path
 *         name: idpp
 *         schema:
 *           type: string
 *         required: true
 *         description: The pickpoint ID
 *     responses:
 *       200:
 *         description: Pickpoint deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Pickpoint deleted successfully
 *                 type:
 *                   type: string
 *                   example: success
 *       404:
 *         description: Benefactor or pickpoint not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Benefactor not found
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
router.delete("/:id/pickpoints/:idpp", pickpointController.deletePickpoint);

/**
 * @swagger
 * /benefactors/{id}/pickpoints/all:
 *   post:
 *     summary: Retrieve all pickpoints of a benefactor
 *     tags:
 *       - Pickpoints
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The benefactor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order[0][dir]:
 *                 type: string
 *                 description: Sort direction
 *               order[0][column]:
 *                 type: integer
 *                 description: Index of the column to order by
 *               search[value]:
 *                 type: string
 *                 description: Search value
 *     responses:
 *       200:
 *         description: Pickpoints retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 draw:
 *                   type: integer
 *                   example: 1
 *                 recordsTotal:
 *                   type: integer
 *                   example: 5
 *                 recordsFiltered:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The pickpoint ID
 *                       country:
 *                         type: string
 *                         description: Country of the pickpoint
 *                       city:
 *                         type: string
 *                         description: City of the pickpoint
 *                       street:
 *                         type: string
 *                         description: Street of the pickpoint
 *                       postalCode:
 *                         type: string
 *                         description: Postal code of the pickpoint
 *                       active:
 *                         type: boolean
 *                         description: Indicates if the pickpoint is active
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: The date and time the pickpoint was created
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         description: The date and time the pickpoint was last updated
 *       404:
 *         description: Benefactor not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Benefactor not found
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
router.post("/:id/pickpoints/all", pickpointController.getAllPickpoints);

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Posts management APIs
 */

/**
 * @swagger
 * /benefactors/{benfactorId}/posts:
 *   post:
 *     tags: [Posts]
 *     summary: Add a new post to a benefactor
 *     parameters:
 *       - in: path
 *         name: benfactorId
 *         schema:
 *           type: string
 *         required: true
 *         description: The benefactor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BenefactorPost'
 *     responses:
 *       200:
 *         description: Post added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Post added successfully
 *                 data:
 *                   $ref: '#/components/schemas/BenefactorPost'
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
router.post(
    "/:benefactorId/posts/",
    auth.isAuthenticated,
    postController.addPost
);

/**
 * @swagger
 * /benefactors/{benefactorId}/posts/{postId}:
 *   put:
 *     tags: [Posts]
 *     summary: Update an existing post
 *     security:
 *       - JwtCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: benefactorId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the benefactor
 *       - in: path
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BenefactorPost'
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post Title was updated successfully."
 *                 type:
 *                   type: string
 *                   example: success
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post not found"
 *                 type:
 *                   type: string
 *                   example: danger
 *       500:
 *         description: Failed to update post
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred during the update process."
 *                 type:
 *                   type: string
 *                   example: error
 */
router.put(
    "/:benefactorId/posts/:postId",
    auth.isAuthenticated,
    postController.updatePost
);

/**
 * @swagger
 *  /benefactors/{benefactorId}/posts/{postId}:
 *   delete:
 *     tags: [Posts]
 *     summary: Delete an existing post
 *     security:
 *       - JwtCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: benefactorId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the benefactor
 *       - in: path
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post Title was deleted successfully."
 *                 type:
 *                   type: string
 *                   example: success
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post not found"
 *                 type:
 *                   type: string
 *                   example: danger
 *       500:
 *         description: Failed to delete post
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred during the deletion process."
 *                 type:
 *                   type: string
 *                   example: error
 */
router.delete(
    "/:benefactorId/posts/:postId",
    auth.isAuthenticated,
    postController.deletePost
);

/**
 * @swagger
 *  /benefactors/{benefactorId}/posts/:
 *   get:
 *     tags: [Posts]
 *     summary: Retrieve all posts for a specific benefactor
 *     security:
 *       - JwtCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: benefactorId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the benefactor
 *     responses:
 *       200:
 *         description: A list of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BenefactorPost'
 *       404:
 *         description: No posts found for the specified benefactor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No posts found for the specified benefactor"
 *                 type:
 *                   type: string
 *                   example: danger
 *       500:
 *         description: An error occurred while retrieving the posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while retrieving the posts."
 *                 type:
 *                   type: string
 *                   example: error
 */
router.get(
    "/:benefactorId/posts/",
    auth.isAuthenticated,
    postController.getAllPosts
);

/**
 * @swagger
 *  /benefactors/posts/all:
 *   post:
 *     tags: [Posts]
 *     summary: Retrieve the latest posts with pagination
 *     security:
 *       - JwtCookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *         description: The page number for pagination (default is 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: The limit of posts per page for pagination (default is 10)
 *     responses:
 *       200:
 *         description: A list of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       500:
 *         description: An error occurred while retrieving the posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while retrieving the posts."
 *                 type:
 *                   type: string
 *                   example: error
 */
router.post("/posts/all", auth.isAuthenticated, postController.getLastPosts);

/**
 * @swagger
 * tags:
 *   name: Links
 *   description: Links management APIs
 */

/**
 * @swagger
 * '/benefactors/posts/{postId}/links':
 *   post:
 *     tags: [Links]
 *     summary: Add a new link to a post
 *     security:
 *       - JwtCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Link'
 *     responses:
 *       200:
 *         description: New link added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Link added successfully
 *                 post:
 *                   $ref: '#/components/schemas/Post'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid input
 *       500:
 *         description: Error adding link
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error adding link
 */
router.post("/posts/:postId/links", auth.isAuthenticated, linkController.addLink);

/**
 * @swagger
 * '/benefactors/posts/{postId}/links/{linkId}':
 *   put:
 *     tags: [Links]
 *     summary: Update a link in a post
 *     security:
 *       - JwtCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post
 *       - in: path
 *         name: linkId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the link
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Link'
 *     responses:
 *       200:
 *         description: Link updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Link updated successfully
 *                 post:
 *                   $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post or link not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Post not found or Link not found
 *       500:
 *         description: Error updating link
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error updating link
 */
router.put("/posts/:postId/links/:linkId", auth.isAuthenticated, linkController.updateLink);

/**
 * @swagger
 * '/benefactors/posts/{postId}/links/{linkId}':
 *   delete:
 *     tags: [Links]
 *     summary: Delete a link from a post
 *     security:
 *       - JwtCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post
 *       - in: path
 *         name: linkId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the link
 *     responses:
 *       200:
 *         description: Link deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Link deleted successfully
 *                 post:
 *                   $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post or link not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Post not found or Link not found
 *       500:
 *         description: Error deleting link
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error deleting link
 */
router.delete("/posts/:postId/links/:linkId", auth.isAuthenticated, linkController.deleteLink);

module.exports = router;
