// index.js
require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');

//use the pool from db.js
const db = require('./db');
global.db = db;


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



// App-level data (like shopName before)
app.locals.appData = { appName: "Health Tracker" };

// ROUTES
const mainRoutes = require('./routes/main');
app.use('/', mainRoutes);

// (we'll add these files very soon)
const userRoutes = require('./routes/users');
app.use('/users', userRoutes);

const workoutsRoutes = require('./routes/workouts');
app.use('/workouts', workoutsRoutes);


// Start server
app.listen(port, () => {
  console.log(`Health app listening on port ${port}`);
});
