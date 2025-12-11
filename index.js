// index.js
require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');

// Use the pool from db.js
const db = require('./db');
global.db = db;

// Sanitizer
const expressSanitizer = require('express-sanitizer');

// View engine
app.set('view engine', 'ejs');

// Body parsing + sanitiser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(expressSanitizer());

// Static files (CSS, images, client JS)
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
app.locals.appData = { appName: "Health Tracker" };

// ROUTES
const mainRoutes = require('./routes/main');
app.use('/', mainRoutes);

const userRoutes = require('./routes/users');
app.use('/users', userRoutes);

const workoutsRoutes = require('./routes/workouts');
app.use('/workouts', workoutsRoutes);

// PORT (this fixes your VM error)
const port = process.env.PORT || 8000;

// Start server
app.listen(port, () => {
  console.log(`Health app listening on port ${port}`);
});
