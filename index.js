// index.js
require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const expressSanitizer = require('express-sanitizer');

// Use the pool from db.js
const db = require('./db');
global.db = db;

// ***** BASE PATH FOR DEPLOYMENT *****
const BASE_PATH = '/usr/348';
app.locals.basePath = BASE_PATH;

app.get('/', (req, res) => {
  res.redirect(BASE_PATH + '/');
});

// View engine
app.set('view engine', 'ejs');

// Body parsing + sanitiser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(expressSanitizer());

// Static files (if you have any in /public)
app.use(BASE_PATH + '/public', express.static(path.join(__dirname, 'public')));

// Sessions
app.use(
  session({
    secret: 'change-this-secret',
    resave: false,
    saveUninitialized: false,
  })
);

// Make session available in all EJS views
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// ROUTES
const mainRoutes = require('./routes/main');
const userRoutes = require('./routes/users');
const workoutsRoutes = require('./routes/workouts');

// Mount everything under /usr/348
app.use(BASE_PATH, mainRoutes);              // /usr/348/
app.use(BASE_PATH + '/users', userRoutes);   // /usr/348/users/...
app.use(BASE_PATH + '/workouts', workoutsRoutes); // /usr/348/workouts/...

// PORT
const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Health app listening on port ${port} with base path ${BASE_PATH}`);
});
