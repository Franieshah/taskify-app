var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var fileUpload = require('express-fileupload');
var passport = require('passport')

var CronJob = require('cron').CronJob;
// Creating a cron job which runs on every 10 second
var job = new CronJob('1 * * * * *', function () {
  console.log('You will see this message every minute');
}, null, true, 'America/Los_Angeles');
job.start();

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://franieshah02:franie99@cluster0.wdmuzr3.mongodb.net/todo')
  .then(() => console.log("Database Connection Established.."))
  .catch((err) => console.log("Error in Connection.." + err))

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var taskRouter = require('./routes/task');
var notesRouter = require('./routes/notes');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  maxAge: Date.now() + (30 * 86400 * 1000)
}))

app.use(function (req, res, next) {

  console.log("Session value : " + req.session.admin_name);
  res.locals.name = req.session.admin_name;
  next();
})




app.use(passport.initialize())

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/notes', notesRouter);
app.use('/task', taskRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
