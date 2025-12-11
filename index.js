// index.js
require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const expressSanitizer = require('express-sanitizer');

// Database pool from db.js
const db = require('./db');
global.db = db;

// This is your student web path (used only in views/redirects)
const BASE_PATH = '/usr/348';
app.locals.basePath = BASE_PATH; // available in EJS as basePath

const port = process.env.PORT || 8000;

// View engine
app.set('view engine', 'ejs');

// Body parsing + sanitiser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(expressSanitizer());

// Static files (e.g. /public/style.css)
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

// ROUTES (same style as Berties)
const mainRoutes = require('./routes/main');
app.use('/', mainRoutes);

const userRoutes = require('./routes/users');
app.use('/users', userRoutes);

const workoutsRoutes = require('./routes/workouts');
app.use('/workouts', workoutsRoutes);

// START SERVER
app.listen(port, () => {
  console.log(`Health app listening on port ${port}`);
});
