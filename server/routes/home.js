var express = require('express');
var router = express.Router();
var auth = require('../controllers/AuthenticationController');

/**
 * @swagger
 * tags:
 *   name: Home
 *   description: Home page APIs
 */

/**
 * @swagger
 * '/':
 *   get:
 *     tags: [Home]
 *     summary: Render home page
 *     security:
 *       - JwtCookieAuth: []
 *     responses:
 *       200:
 *         description: Rendered home page
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: HTML content of the home page
 *       500:
 *         description: Internal server error
 */
router.get('/', auth.isAuthenticated, auth.hasRoles(['employee', 'administrator']), function (req, res, next) {
    res.render('home', {title: 'Home', currentRoute: '/home', username: req.user.username, pfp: req.user.image});
});

module.exports = router;
