const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/user/User');

const secretKey = process.env.JWT_SECRET;
const algorithm = 'aes-256-cbc';
const encryptionKey = crypto.scryptSync(secretKey, 'salt', 32);
const iv = Buffer.alloc(16, 0);

function renderLoginForm(req, res) {
    res.render('login.ejs');
}

async function validateLogin(req, res, next) {
    const {username, password} = req.body;
    const fromRest = req.body.rest ? req.body.rest : undefined

    try {
        const user = await User.findOne({ username })
    
        if (!user && !fromRest) {
            res.status(401).render('login', {
                messages: { error: 'Invalid username or password.' }
            });
        } else if (!user && fromRest) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            const token = jwt.sign( { user }, secretKey, { expiresIn: '1h' });
            
            let encryptedToken = encrypt(token);


                if (!fromRest) {
                    res.cookie('token', encryptedToken, {
                        httpOnly: true,
                        sameSite: 'strict',
                    });
                    return res.redirect('/home');
                } else {
                    res.cookie('token', encryptedToken, {
                        httpOnly: true,
                        sameSite: 'strict',
                    });
                    return res.status(200).json({
                        message: 'User authenticated successfully.'
                    })
                }
        } else {
            if (!fromRest) {
                return res.status(401).render('login', {
                    messages: 'Invalid username or password.'
                });
            } else {
                return res.status(401).json({
                    messages: {error: 'Invalid username or password.'}
                });
            }
        }
    } catch (error) {
        if (!fromRest) {
            return res.status(500).render('login', {
                messages: {error: 'An error occured while processing your request, please try again!'}
            });
        } else {
            return res.status(500).json({
                messages: 'An error occured while processing your request, please try again!'
            });
        }
    }
}

function decrypt(encryptedToken) {
    const decipher = crypto.createDecipheriv(algorithm, encryptionKey, iv);
    let decrypted = decipher.update(encryptedToken, 'hex', 'utf8');
    
    decrypted += decipher.final('utf8');
    
    return decrypted;
}

function encrypt(token) {
    const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    
    encrypted += cipher.final('hex');
    
    return encrypted;
}

function isAuthenticated(req, res, next) {
    var fromRest = req.body.rest ? req.body.rest : undefined

    
    const encryptedToken = req.cookies.token;

    if (!encryptedToken && !fromRest) {
        res.redirect('/auth/login');
    } else if (!encryptedToken && fromRest) {
        return res.status(401).json({
            message: 'Unauthorized'
        })
    }

    const decryptedToken = decrypt(encryptedToken);

    jwt.verify(decryptedToken, secretKey, (err, decoded) => {
        if (err && !fromRest) {
            res.redirect('/auth/login');
        } else if (err && fromRest) {
            return res.status(401).json({
                message: 'Unauthorized'
            })
        }
            req.user = decoded.user;
            next();
    });
}

function isNotAuthenticated(req, res, next) {
    var fromRest = req.body.rest ? req.body.rest : undefined

    const encryptedToken = req.cookies.token;

    if (!encryptedToken) {
        return next(); 
    }

    const decryptedToken = decrypt(encryptedToken);

    jwt.verify(decryptedToken, secretKey, (err, decoded) => {
        if (err) {
            return next();
        }


        if (!fromRest) {
            res.redirect('/home');
        } else {
            res.status(500).json({
                message: 'User already authenticated'
            })
        }
    });
}



function hasRoles(roles) {
    return function(req, res, next) {
        if (!req.user || !req.user.roles) {
            res.render('error', 
            {
                message: 'User not found.', 
                error: { 
                    status: 500,
                    stack: 'User was not found. Please log in and try again.'
                }
            }
            )
        }

        const authorized = roles.some(role => req.user.roles.includes(role));

        if (!authorized) {
            res.render('error', 
            { 
                message: 'Access denied.',
                error: {
                    status: 500,
                    stack: 'Access denied. You do not have the necessary permissions to access this page.'
                }
            }
            )        
        }

        next();
    };
}

function logout(req, res) {
    res.clearCookie('token');
    res.redirect('/auth/login');
}

module.exports = {
    renderLoginForm,
    validateLogin,
    isAuthenticated,
    isNotAuthenticated,
    hasRoles,
    logout
};