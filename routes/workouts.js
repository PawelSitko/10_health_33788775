// routes/workouts.js
const express = require('express');
const router = express.Router();

// shared DB pool
const db = global.db || require('../db');

// Middleware to require login
function requireLogin(req, res, next) {
  if (!req.session || !req.session.user) {
    // redirect to login, keeping the original url in ?next=
    return res.redirect('/users/login?next=/workouts');
  }
  next();
}

// GET /workouts – show list of workouts (protected)
router.get('/', requireLogin, (req, res) => {
  const userId = req.session.user.id;

  db.query(
    'SELECT * FROM workouts WHERE user_id = ? ORDER BY date DESC',
    [userId],
    (err, results) => {
      if (err) {
        console.error('Error fetching workouts:', err);
        return res.render('workouts', {
          error: 'Could not load workouts.',
          workouts: [],
        });
      }

      res.render('workouts', {
        error: null,
        workouts: results,
        user: req.session.user,
      });
    }
  );
});

module.exports = router;
