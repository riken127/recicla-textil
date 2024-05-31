const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/user/User');
const Benefactor = require('../models/benefactor/Benefactor')

const secretKey = process.env.JWT_SECRET;
const algorithm = "aes-256-cbc";
const encryptionKey = crypto.scryptSync(secretKey, "salt", 32);
const iv = Buffer.alloc(16, 0);

function renderLoginForm(req, res) {
  res.render("login.ejs");
}

async function validateLogin(req, res, next) {
  const { username, password } = req.body;
  const fromRest = req.body.rest ? req.body.rest : undefined;

    try {
        const user = await User.findOne({ username });

        if (!user && !fromRest) {
            res.status(401).render("login", {
                messages: { error: "Invalid username or password." },
            });
        } else if (!user && fromRest) {
            res.status(401).json({ error: "Invalid username or password." });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            const token = jwt.sign({ user }, secretKey, { expiresIn: "1h" });

            let encryptedToken = encrypt(token);

            if (!fromRest) {
                res.cookie("token", encryptedToken, {
                    httpOnly: true,
                    sameSite: "strict",
                });

                res.redirect("/home");
            } else {
                res.cookie("token", encryptedToken, {
                    httpOnly: true,
                    sameSite: "strict",
                });

                res.status(200).json({
                    message: "User authenticated successfully.",
                });
            }
        } else {
            if (!fromRest) {
                res.status(401).render("login", {
                    messages: { error: "Invalid username or password." },
                });
            } else {
                res.status(401).json("login", {
                    messages: { error: "Invalid username or password." },
                });
            }
        }
    } catch (error) {
        if (!fromRest) {
            res.status(500).render("login", {
                messages: {
                    error:
                        "An error occured while processing your request, please try again!",
                },
            });
        } else {
            res.status(500).json("login", {
                messages: {
                    error:
                        "An error occured while processing your request, please try again!",
                },
            });
        }
    }
}

async function handleUserLogin(res, name, password, fromRest) {
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
                sameSite: 'strict',
            });

            return res.redirect('/home');
        } else {
            res.cookie('token', encryptedToken, {
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
}

async function handleBenefactorLogin(res, username, password) {
    const benefactor = await Benefactor.findOne({username})

    if (!benefactor) {
        return res.status(401).json({
            message: 'Invalid username of password.'
        });
    }

    const passwordMatch = await bcrypt.compare(password, benefactor.password);

    if (passwordMatch) {
        const token = jwt.sign( { benefactor }, secretKey, { expiresIn: '1h' });

        let encryptedToken = encrypt(token);

        res.cookie('token', encryptedToken, {
            sameSite: 'strict',
        });

        return res.status(200).json({
            message: 'Benefactor authenticated sucessfully.'
        });
    } else {
        return res.status(401).json({
            message: 'Invalid username or password.'
        })
    }
}

async function validateLogin(req, res, next) {
    const { benefactor } = req.body;
    const {username, password} = req.body;
    const fromRest = req.body.rest ? req.body.rest : undefined

    try {
        if (!benefactor) {
            await handleUserLogin(res, username, password, fromRest);
        } else {
            await handleBenefactorLogin(res, username, password);
        }
    } catch (error) {
        if (!fromRest) {
            return res.status(500).render('login', {
                messages: {error: 'An error occured while processing your request, please try again!'}
            });
        } else {
            return res.status(500).json({
                messages: 'An error occured while processing your request, please try again!' + error
            });
        }
    }
}

function decrypt(encryptedToken) {
  const decipher = crypto.createDecipheriv(algorithm, encryptionKey, iv);
  let decrypted = decipher.update(encryptedToken, "hex", "utf8");

  decrypted += decipher.final("utf8");

  return decrypted;
}

function encrypt(token) {
  const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);
  let encrypted = cipher.update(token, "utf8", "hex");

  encrypted += cipher.final("hex");

  return encrypted;
}

function isLoggedIn(req, res) {
    const encryptedToken = req.cookies.token;

    if (!encryptedToken) {
        return res.status(401).json({
            message: 'Unauthorized'
        });
    }

    const decryptedToken = decrypt(encryptedToken);

    jwt.verify(decryptedToken, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                message: 'Unauthorized'
            });
        }

        return res.status(200).json({
            message: 'The current entity is logged in.'
        });

    })

}

function isAuthenticated(req, res, next) {
  var fromRest = req.body.rest ? req.body.rest : undefined;

  const encryptedToken = req.cookies.token;

  if (!encryptedToken && !fromRest) {
    res.redirect("/auth/login");
  } else if (!encryptedToken && fromRest) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const decryptedToken = decrypt(encryptedToken);

  jwt.verify(decryptedToken, secretKey, (err, decoded) => {
    if (err && !fromRest) {
      res.redirect("/auth/login");
    } else if (err && fromRest) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    req.user = decoded.user;
    next();
  });
}

function isNotAuthenticated(req, res, next) {
  var fromRest = req.body.rest ? req.body.rest : undefined;

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
      res.redirect("/home");
    } else {
      res.status(500).json({
        message: "User already authenticated",
      });
    }
  });
}

function hasRoles(roles) {
  return function (req, res, next) {
    if (!req.user || !req.user.roles) {
      res.render("error", {
        message: "User not found.",
        error: {
          status: 500,
          stack: "User was not found. Please log in and try again.",
        },
      });
    }

    const authorized = roles.some((role) => req.user.roles.includes(role));

    if (!authorized) {
      res.render("error", {
        message: "Access denied.",
        error: {
          status: 500,
          stack:
            "Access denied. You do not have the necessary permissions to access this page.",
        },
      });
    }

    next();
  };
}

function logout(req, res) {
  res.clearCookie("token");
  res.redirect("/auth/login");
}

function getDecodedToken(req, res) {
  try {
    let id = req.query.id;
    let fName = req.query.fName;
    let lName = req.query.lName;

    const encryptedToken = req.cookies.token;
    const decryptedToken = decrypt(encryptedToken);
    const decodedToken = jwt.decode(decryptedToken);
    const result = {};

    if (id !== undefined) {
      result.id = decodedToken.user._id;
    }

    if (fName !== undefined) {
      result.fName = decodedToken.user.firstName;
    }

    if (lName !== undefined) {
      result.lName = decodedToken.user.lastName;
    }

    if (
      result.id === undefined &&
      result.fName === undefined &&
      result.lName === undefined
    ) {
      return res.status(500).json({
        type: "error",
        message: "no parameters could be fulfilled.",
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      type: "error",
      message: error,
    });
  }
}

module.exports = {
    renderLoginForm,
    validateLogin,
    isAuthenticated,
    isNotAuthenticated,
    hasRoles,
    logout,
    isLoggedIn,
    getDecodedToken,
};