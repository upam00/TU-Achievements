var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var catalogRouter = require('./routes/catalog');  //Import routes for "catalog" area of site

var compression = require('compression');
var helmet = require('helmet');

var app = express();
var helmet = require("helmet");
var compression = require('compression');

app.use(compression());

app.use(helmet());

app.use(express.json());

///-----
const { auth } = require('express-openid-connect');

const config = {
  authRequired: false,
  auth0Logout: true,
  baseURL: 'https://tu-achivements.herokuapp.com',
  clientID: 'WwjSeqQdrBQ4BmMuNaaMSEZJa8TVtvP5',
  issuerBaseURL: 'https://dev-hfggxb89.us.auth0.com',
  secret: 'dflkgdfklgmdfklgmftjfjygkgyikgygykgyk',
  //redirect_uri: 'https://tu-achivements.herokuapp.com/catalog'
  //redirect_uri: 'http://localhost:3000/good'
  /*routes: {
    // Override the default login route to use your own login route as shown below
    login: false,
    // Pass a custom path to redirect users to a different
    // path after logout.
    postLogoutRedirect: '/custom-logout',
  },
  */
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));



///-----

// Set up mongoose connection
var mongoose = require('mongoose');
var dev_db_url = 'mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true';
var mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static('resources'))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet());
app.use(compression()); // Compress all routes

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/callback', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter);  // Add catalog routes to middleware chain.
//res.send(`Hello ${req.oidc.user.sub}, this is the admin section.`)

const { requiresAuth } = require('express-openid-connect');
//var myrouter = express.Router();
//var async = require('async');
var mongoose = require('mongoose');
/*var Book = mongoose.models.Book;
var Author = mongoose.models.Author;
var Genre = mongoose.models.Genre
var BookInstance = mongoose.models.BookInstance;
*/
//const { body,validationResult } = require("express-validator");

/*
myrouter.get('/', requiresAuth(), (req, res) => {
  
  async.parallel({
    book_count: function (callback) {
      Book.countDocuments({}, callback);
    },
    book_instance_count: function (callback) {
      BookInstance.countDocuments({}, callback);
    },
    book_instance_available_count: function (callback) {
      BookInstance.countDocuments({ status: 'Available' }, callback);
    },
    author_count: function (callback) {
      Author.countDocuments({}, callback);
    },
    genre_count: function (callback) {
      Genre.countDocuments({}, callback);
    },
  }, function (err, results) {
    res.render('adminhome', { title: 'Local Library Home', error: err, data: results });
  });
  
 //res.send(`Hello ${req.oidc.user.sub}, this is the admin section.`)
})

app.use('/good', myrouter);
*/


/*app.get('/login', (req, res) => res.oidc.login({ returnTo: '/gotologin' }));

app.get('/custom-logout', (req, res) => res.send('Bye!'));
*/




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
