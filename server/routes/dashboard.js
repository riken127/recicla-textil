var express = require('express');
var router = express.Router();
var dashboardController = require('../controllers/DashboardController');
var auth = require('../controllers/AuthenticationController')

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Operations related to the user dashboard
 */

/**
 * @swagger
 * /dashboard/users:
 *   get:
 *     summary: Fetches and returns user dashboard data
 *     tags: [Dashboard]
 *     security:
 *       - JwtCookieAuth: []
 *       - hasRoles: ['administrator']
 *     responses:
 *       200:
 *         description: User dashboard data retrieved successfully
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: HTML content for the user dashboard
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error fetching aggregation data
 */
router.get('/users', auth.isAuthenticated, auth.hasRoles(['administrator']), dashboardController.returnUsersDashboard);

/**
 * @swagger
 * /dashboard/benefactors:
 *   get:
 *     summary: Fetches and returns benefactors dashboard data
 *     tags: [Dashboard]
 *     security:
 *       - JwtCookieAuth: []
 *       - hasRoles: ['administrator']
 *     responses:
 *       200:
 *         description: Benefactors dashboard data retrieved successfully
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: HTML content for the benefactors dashboard
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error fetching aggregation data
 */
router.get('/benefactors', auth.isAuthenticated, auth.hasRoles(['administrator']), dashboardController.returnBenefactorsDashboard);

/**
 * @swagger
 * /dashboard/donations:
 *   get:
 *     summary: Fetches and returns donations dashboard data
 *     tags: [Dashboard]
 *     security:
 *       - JwtCookieAuth: []
 *       - hasRoles: ['administrator']
 *     responses:
 *       200:
 *         description: Donations dashboard data retrieved successfully
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: HTML content for the donations dashboard
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error fetching aggregation data
 */
router.get('/donations', auth.isAuthenticated, auth.hasRoles(['administrator']), dashboardController.returnDonationsDashboard);

module.exports = router;