// routes/workouts.js
const express = require('express');
const router = express.Router();
const db = global.db || require('../db');

// Middleware to ensure user is logged in
function requireLogin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect('/users/login');
  }
  next();
}


// LIST WORKOUTS  ->  GET /workouts/list
router.get('/list', requireLogin, (req, res) => {
  const userId = req.session.user.id;

  db.query(
    'SELECT * FROM workouts WHERE user_id = ? ORDER BY workout_date DESC',
    [userId],
    (err, results) => {
      if (err) {
        console.error('Error fetching workouts:', err);
        return res.render('workouts_list', {
          workouts: [],
          user: req.session.user,
          error: 'Could not load workouts from database.'
        });
      }

      res.render('workouts_list', {
        workouts: results,
        user: req.session.user,
        error: null
      });
    }
  );
});


// ADD WORKOUT FORM  ->  GET /workouts/add
router.get('/add', requireLogin, (req, res) => {
  res.render('workouts_add', {
    user: req.session.user,
    error: null
  });
});


// ADD WORKOUT (POST) -> POST /workouts/add
router.post('/add', requireLogin, (req, res) => {
  const userId = req.session.user.id;
  const { date, type, duration, intensity, notes } = req.body;

  if (!date || !type || !duration || !intensity) {
    return res.render('workouts_add', {
      user: req.session.user,
      error: 'Please fill in all required fields.'
    });
  }

  db.query(
    'INSERT INTO workouts (user_id, workout_date, workout_type, duration_minutes, intensity, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, date, type, duration, intensity, notes || null],
    (err) => {
      if (err) {
        console.error('Error inserting workout:', err);
        return res.render('workouts_add', {
          user: req.session.user,
          error: 'Could not save workout. Please try again.'
        });
      }

      res.redirect('/workouts/list');
    }
  );
});


// EDIT WORKOUT FORM -> GET /workouts/edit/:id
router.get('/edit/:id', requireLogin, (req, res) => {
  const id = req.params.id;

  db.query(
    'SELECT * FROM workouts WHERE id = ? AND user_id = ?',
    [id, req.session.user.id],
    (err, results) => {
      if (err || results.length === 0) {
        console.error('Error fetching workout to edit:', err);
        return res.send('Workout not found.');
      }

      res.render('workouts_edit', {
        workout: results[0],
        user: req.session.user,
        error: null
      });
    }
  );
});


// UPDATE WORKOUT -> POST /workouts/edit/:id
router.post('/edit/:id', requireLogin, (req, res) => {
  const id = req.params.id;
  const { date, type, duration, intensity, notes } = req.body;

  db.query(
    'UPDATE workouts SET workout_date=?, workout_type=?, duration_minutes=?, intensity=?, notes=? WHERE id=? AND user_id=?',
    [date, type, duration, intensity, notes || null, id, req.session.user.id],
    (err) => {
      if (err) {
        console.error('Error updating workout:', err);
        return res.send('Update failed.');
      }

      res.redirect('/workouts/list');
    }
  );
});

// ------------------------------------------------------------
// DELETE WORKOUT -> GET /workouts/delete/:id
// ------------------------------------------------------------
router.get('/delete/:id', requireLogin, (req, res) => {
  const id = req.params.id;

  db.query(
    'DELETE FROM workouts WHERE id=? AND user_id=?',
    [id, req.session.user.id],
    (err) => {
      if (err) {
        console.error('Error deleting workout:', err);
        return res.send('Delete failed.');
      }

      res.redirect('/workouts/list');
    }
  );
});


// SEARCH WORKOUTS 
router.get('/search', requireLogin, (req, res) => {
  const userId = req.session.user.id;
  const q = (req.query.q || '').trim();
  const pattern = `%${q}%`;

  db.query(
    'SELECT * FROM workouts WHERE user_id = ? AND (workout_type LIKE ? OR notes LIKE ?) ORDER BY workout_date DESC',
    [userId, pattern, pattern],
    (err, results) => {
      if (err) {
        console.error('Search error:', err);
        return res.render('workouts_list', {
          workouts: [],
          user: req.session.user,
          error: 'Search failed.'
        });
      }

      res.render('workouts_list', {
        workouts: results,
        user: req.session.user,
        error: null
      });
    }
  );
});

module.exports = router;
