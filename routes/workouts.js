const express = require('express');
const router = express.Router();
const db = global.db || require('../db');

function requireLogin(req, res, next) {
  const basePath = req.app.locals.basePath || '';
  if (!req.session || !req.session.user) {
    return res.redirect(`${basePath}/users/login`);
  }
  next();
}

// /workouts → /usr/348/workouts/list
router.get('/', requireLogin, (req, res) => {
  const basePath = req.app.locals.basePath || '';
  res.redirect(`${basePath}/workouts/list`);
});

// GET /workouts/list
router.get('/list', requireLogin, (req, res) => {
  const userId = req.session.user.id;

  db.query(
    'SELECT * FROM workouts WHERE user_id = ? ORDER BY date DESC',
    [userId],
    (err, results) => {
      if (err) {
        console.error('Error fetching workouts:', err);
        return res.render('workouts_list', {
          error: 'Could not load workouts.',
          workouts: [],
          user: req.session.user
        });
      }

      res.render('workouts_list', {
        error: null,
        workouts: results,
        user: req.session.user
      });
    }
  );
});

// ...for add/edit/search, just use the same pattern:
router.post('/add', requireLogin, (req, res) => {
  const basePath = req.app.locals.basePath || '';
  const userId = req.session.user.id;
  const { date, activity, duration, intensity, notes } = req.body;

  db.query(
    'INSERT INTO workouts (user_id, date, activity, duration, intensity, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, date, activity, duration, intensity || null, notes || null],
    (err) => {
      if (err) {
        console.error('Error inserting workout:', err);
        return res.render('workouts_add', {
          error: 'Could not save workout.',
          formData: req.body
        });
      }
      res.redirect(`${basePath}/workouts/list`);
    }
  );
});

module.exports = router;
