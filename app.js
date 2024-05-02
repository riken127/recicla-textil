require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
var usersRouter = require('./routes/users');
var flash = require('express-flash');
var session = require('express-session');
var donationRouter = require('./routes/donations');
var benefactorRouter = require('./routes/benefactors');
var dashboardRouter = require('./routes/dashboard');
var homeRouter = require('./routes/home');
var authRouter = require('./routes/auth');
var initializePassport = require('./middleware/passportConfiguration');
var mongoose = require('mongoose');
var User = require('./models/user/User');
initializePassport(
    passport,
    (userName) => {
        return User.findOne({username: userName})
    },
    (id) => {
        return User.findById(id)
    }
)


var app = express();
var mongoose = require('mongoose');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);
app.use('/donations', donationRouter);
app.use('/benefactors', benefactorRouter);
app.use('/dashboard', dashboardRouter);
app.use('/home', homeRouter);


app.use('/auth', authRouter.router);
// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('MongoDB Connected successfully.');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
