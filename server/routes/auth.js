var express = require("express");
var router = express.Router();
var authController = require("../controllers/AuthenticationController");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and Authorization APIs
 */

/**
 * @swagger
 * '/auth/login':
 *   get:
 *     tags: [Auth]
 *     summary: Render login page
 *     security:
 *       - JwtCookieAuth: []
 *     responses:
 *       200:
 *         description: Rendered login page
 *       500:
 *         description: Internal server error
 */
router.get("/login", authController.isNotAuthenticated, (req, res) => {
  res.render("login.ejs");
});

/**
 * @swagger
 * '/auth/login':
 *   post:
 *     tags: [Auth]
 *     summary: Validate login credentials and generate JWT cookie
 *     security:
 *       - JwtCookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Redirect to home page after successful login
 *       401:
 *         description: Invalid username or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post(
  "/login",
  authController.isNotAuthenticated,
  authController.validateLogin
);

/**
 * @swagger
 * '/auth/logout':
 *   post:
 *     tags: [Auth]
 *     summary: Logout and clear authentication token
 *     security:
 *       - JwtCookieAuth: []
 *     responses:
 *       302:
 *         description: Redirect to login page after successful logout
 *       500:
 *         description: Internal server error
 */
router.post("/logout", authController.logout);

/**
 * @swagger
 * '/auth/getToken':
 *   post:
 *     tags: [Auth]
 *     summary: Get decoded token
 *     security:
 *       - JwtCookieAuth: []
 *     responses:
 *       200:
 *         description: Sucessfully decoded token
 *       500:
 *         description: Internal server error
 */
router.get("/getToken", authController.getDecodedToken);

module.exports = router;
