// routes/main.js
const express = require('express');
const router = express.Router();

// Home page – /usr/348/
router.get('/', (req, res) => {
  res.render('home');
});

module.exports = router;
