// routes/main.js
const express = require('express');
const router = express.Router();

// Home page  → GET /
router.get('/', (req, res) => {
  res.render('home');
});

// Optional about page if you want it
router.get('/about', (req, res) => {
  res.render('about');
});

module.exports = router;
