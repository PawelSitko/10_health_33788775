// index.js
require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const expressSanitizer = require('express-sanitizer');

// DB pool from db.js
const db = require('./db');
global.db = db;

const port = process.env.PORT || 8000;

// View engine
app.set('view engine', 'ejs');

// Body parsing + sanitiser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(expressSanitizer());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

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

// App-level globals
app.locals.appData = { appName: 'Health Tracker' };

// ROUTES
const mainRoutes = require('./routes/main');
const userRoutes = require('./routes/users');
const workoutsRoutes = require('./routes/workouts');

app.use('/', mainRoutes);        // /, /about
app.use('/users', userRoutes);   // /users/login, /users/register, /users/logout
app.use('/workouts', workoutsRoutes); // /workouts/list, /workouts/add, etc.

// Start server
app.listen(port, () => {
  console.log(`Health app listening on port ${port}`);
});
