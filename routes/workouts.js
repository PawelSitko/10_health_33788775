// routes/workouts.js
const express = require('express');
const router = express.Router();
const db = global.db || require('../db');

const BASE_PATH = '/usr/348';

// Simple auth middleware
function requireLogin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect(`${BASE_PATH}/users/login`);
  }
  next();
}

// Redirect /usr/348/workouts → /usr/348/workouts/list
router.get('/', (req, res) => {
  res.redirect(`${BASE_PATH}/workouts/list`);
});

// GET /usr/348/workouts/list
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

// GET /usr/348/workouts/add
router.get('/add', requireLogin, (req, res) => {
  res.render('workouts_add', {
    error: null,
    formData: {}
  });
});

// POST /usr/348/workouts/add
router.post('/add', requireLogin, (req, res) => {
  const userId = req.session.user.id;
  const { date, activity, duration, intensity, notes } = req.body;

  if (!date || !activity || !duration) {
    return res.render('workouts_add', {
      error: 'Please fill in at least date, activity and duration.',
      formData: req.body
    });
  }

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

      res.redirect(`${BASE_PATH}/workouts/list`);
    }
  );
});

// GET /usr/348/workouts/edit/:id
router.get('/edit/:id', requireLogin, (req, res) => {
  const id = req.params.id;
  const userId = req.session.user.id;

  db.query(
    'SELECT * FROM workouts WHERE id = ? AND user_id = ?',
    [id, userId],
    (err, results) => {
      if (err || results.length === 0) {
        console.error('Error fetching workout to edit:', err);
        return res.redirect(`${BASE_PATH}/workouts/list`);
      }

      res.render('workouts_edit', {
        error: null,
        workout: results[0]
      });
    }
  );
});

// POST /usr/348/workouts/edit/:id
router.post('/edit/:id', requireLogin, (req, res) => {
  const id = req.params.id;
  const userId = req.session.user.id;
  const { date, activity, duration, intensity, notes } = req.body;

  db.query(
    'UPDATE workouts SET date = ?, activity = ?, duration = ?, intensity = ?, notes = ? WHERE id = ? AND user_id = ?',
    [date, activity, duration, intensity || null, notes || null, id, userId],
    (err) => {
      if (err) {
        console.error('Error updating workout:', err);
      }
      res.redirect(`${BASE_PATH}/workouts/list`);
    }
  );
});

// GET /usr/348/workouts/search
router.get('/search', requireLogin, (req, res) => {
  const userId = req.session.user.id;
  const q = req.query.q || '';

  if (!q) {
    return res.render('workouts_search', {
      error: null,
      workouts: [],
      query: '',
      user: req.session.user
    });
  }

  db.query(
    'SELECT * FROM workouts WHERE user_id = ? AND activity LIKE ? ORDER BY date DESC',
    [userId, '%' + q + '%'],
    (err, results) => {
      if (err) {
        console.error('Error searching workouts:', err);
        return res.render('workouts_search', {
          error: 'Could not search workouts.',
          workouts: [],
          query: q,
          user: req.session.user
        });
      }

      res.render('workouts_search', {
        error: null,
        workouts: results,
        query: q,
        user: req.session.user
      });
    }
  );
});

module.exports = router;
