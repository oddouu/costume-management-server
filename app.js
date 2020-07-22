require('dotenv').config();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const favicon = require('serve-favicon');
const hbs = require('hbs');
const mongoose = require('mongoose');
const logger = require('morgan');
const path = require('path');

const cors = require('cors');
const session = require('express-session');
const passport = require('passport');

require('./config/passport');

mongoose
  .connect('mongodb://localhost/costume-management-server', {
    useNewUrlParser: true
  })
// mongoose
//   .connect(process.env.MONGODB_URI, {
//     useNewUrlParser: true
//   })
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

// Express View engine setup

app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

// session settings
app.use(session({
  secret: 'myapplication',
  resave: true,
  saveUninitialized: true,
  rolling: true,
  cookie: {
    expires: 600000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// default value for title local
app.locals.title = 'costume management app';

// CORS settings
app.use(
  cors({
    credentials: true, // IMPORTANT! We will receive the credentials on the backend when requesting stuff using axios. if we want to add the token in the header of the API request, we need to add the credentials in the CORS settings
    origin: ['http://localhost:3000', 'http://costume-management-app.s3-website-eu-west-1.amazonaws.com', 'https://costume-management-client.herokuapp.com']
  })
);


const index = require('./routes/index');
app.use('/', index);
app.use('/api', require('./routes/project-routes'));
app.use('/api', require('./routes/character-routes'));
app.use('/api', require('./routes/measure-routes'));
app.use('/api', require('./routes/costume-routes'));
app.use('/api', require('./routes/scene-routes'));
app.use('/api', require('./routes/location-routes'));
app.use('/api', require('./routes/auth-routes'));
app.use('/api', require('./routes/image-routes'));



module.exports = app;