require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var usersRouter = require('./routes/users');

var donationRouter = require('./routes/donations');
var benefactorRouter = require('./routes/benefactors');
var userRouter = require('./routes/user/user');
var dashboardRouter = require('./routes/dashboard');


var app = express();
var mongoose = require('mongoose');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/donations', donationRouter);
app.use('/benefactors', benefactorRouter);
app.use('/dashboard', dashboardRouter);

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
// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
