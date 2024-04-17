const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate JWT token.
 *
 * This middleware function verifies the JWT token present in the 'Authorization' header
 * of the incoming request. If the token is valid, it sets the decoded user information
 * in the request object and passes control to the next middleware function. If the token
 * is missing or invalid, it responds with appropriate status codes.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @returns {void}
 * @example
 * // Usage:
 * router.use(authenticateToken);
 */
function authenticateToken(req, res, next) {
    // Extract token from the 'Authorization' header
    const token = req.headers['authorization'];

    // If token is missing, respond with 401 Unauthorized
    if (token == null) return res.sendStatus(401);

    // Verify the JWT token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        // If token verification fails, respond with 403 Forbidden
        if (err) return res.sendStatus(403);

        // If token verification is successful, set the decoded user information in the request object
        req.user = user;

        // Pass control to the next middleware function
        next();
    });
}

module.exports = authenticateToken;
