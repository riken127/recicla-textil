var express = require('express');
var upload = require('../middleware/multerMiddleware');
var router = express.Router();
var userController = require('../controllers/UserController');
var auth = require('../controllers/AuthenticationController')

// upload user image
router.post('/upload/',upload.single('image'),userController.uploadImage);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management APIs
 */

/**
 * @swagger
 * /users/all:
 *   get:
 *     summary: Render the table of users
 *     tags: [Users]
 *     security:
 *       - JwtCookieAuth: []
 *       - hasRoles: ['administrator']
 *     responses:
 *       200:
 *         description: Table of users rendered successfully
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: HTML content of the users table page
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
router.get('/all', auth.isAuthenticated, auth.hasRoles(['administrator']), userController.renderUsersTable);

/**
 * @swagger
 * /users/:
 *   post:
 *     summary: Add a new user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User added successfully
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
 *                   example: "60a1f2d96c8a2b001c7ef9e8"
 *       400:
 *         description: User already exists
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
router.post('/', auth.isAuthenticated, userController.addUser)

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update an existing user
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: John was updated successfully.
 *       400:
 *         description: User with provided email or phone number already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email already registered in another user.
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
router.put('/:id', auth.isAuthenticated, userController.updateUser)
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Retrieve user information by ID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user to retrieve
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
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
router.get('/:id', userController.getUser)
/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User deleted successfully
 *                 type:
 *                   type: string
 *                   example: success
 *       404:
 *         description: User not found or already inactive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found or already inactive
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
router.delete('/:id', auth.isAuthenticated, userController.deleteUser)
/**
 * @swagger
 * /users/all:
 *   post:
 *     summary: Retrieve all users with DataTables parameters
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               draw:
 *                 type: integer
 *                 description: The draw counter from DataTables
 *                 example: 1
 *               start:
 *                 type: integer
 *                 description: The start index for pagination
 *                 example: 0
 *               length:
 *                 type: integer
 *                 description: The number of records per page
 *                 example: 10
 *               search:
 *                 type: object
 *                 description: The search object from DataTables
 *                 properties:
 *                   value:
 *                     type: string
 *                     description: The search value entered by the user
 *                     example: John
 *               order:
 *                 type: array
 *                 description: The order array from DataTables
 *                 items:
 *                   type: object
 *                   properties:
 *                     column:
 *                       type: integer
 *                       description: The index of the column to sort by
 *                       example: 0
 *                     dir:
 *                       type: string
 *                       enum: [asc, desc]
 *                       description: The sorting direction
 *                       example: asc
 *     responses:
 *       200:
 *         description: Users retrieved successfully
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
 *                   example: 100
 *                 recordsFiltered:
 *                   type: integer
 *                   example: 50
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
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
router.post('/all', userController.getAllUsers);

// route exportation
module.exports = router;
