const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

function initialize(passport, getUserByUsername, getUserById) {
const authenticateUser = async (username, password, done) => {
        getUserByUsername(username)
        .then(user => {
            if (!user) {
                return done(null, false, {message: 'No user with specified username.'});
            }

            if (!user.password || !password) {
                return done(null, false, {message: 'Password not provided.'});
            }

            try {
                if (bcrypt.compareSync(password, user.password) && (user.roles[0] === 'administrator' || user.roles[0] === 'employee')) {
                    return done(null, user);
                } else if (user.roles[0] !== 'administrator' || user.roles[0] !== 'employee') {
                    return done(null, false, {
                        message: 'Access Denied! Administrators will be notified.'
                    });
                } else {
                    return done(null, false, {
                        message: 'Incorrect password, try again!'}
                    );
                }
            } catch (e) {
                return done(e);
            }
        })
}

    passport.use(new LocalStrategy({ usernameField: 'username' }, authenticateUser));
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });
    passport.deserializeUser((id, done) => {
        getUserById(id)
            .then(user => {
                done(null, user);
            })
    });
}

module.exports = initialize;