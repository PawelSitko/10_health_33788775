// routes/main.js
const express = require('express');
const router = express.Router();

// Home page – renders index.ejs
router.get('/', (req, res) => {
  res.render('index.ejs');
});

// About page – renders about.ejs
router.get('/about', (req, res) => {
  res.render('about.ejs');
});

module.exports = router;
