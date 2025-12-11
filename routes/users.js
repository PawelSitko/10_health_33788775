// routes/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const db = global.db || require('../db');
const SALT_ROUNDS = 10;

// GET /users/register
router.get('/register', (req, res) => {
  res.render('register', {
    error: null,
    formData: {}
  });
});

// POST /users/register
router.post('/register', (req, res) => {
  const { first, last, email, username, password } = req.body;

  if (!first || !last || !email || !username || !password) {
    return res.render('register', {
      error: 'Please fill in all fields.',
      formData: req.body
    });
  }

  db.query(
    'SELECT id FROM users WHERE username = ?',
    [username],
    async (err, results) => {
      if (err) {
        console.error('Error checking existing user:', err);
        return res.render('register', {
          error: 'Database error.',
          formData: req.body
        });
      }

      if (results.length > 0) {
        return res.render('register', {
          error: 'Username is already taken.',
          formData: req.body
        });
      }

      try {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        db.query(
          'INSERT INTO users (first, last, email, username, password) VALUES (?, ?, ?, ?, ?)',
          [first, last, email, username, hashedPassword],
          (err2) => {
            if (err2) {
              console.error('Error inserting user:', err2);
              return res.render('register', {
                error: 'Error creating account.',
                formData: req.body
              });
            }

            // After register, go to login
            res.redirect('/users/login');
          }
        );
      } catch (e) {
        console.error('Error during registration:', e);
        res.render('register', {
          error: 'Unexpected error.',
          formData: req.body
        });
      }
    }
  );
});

// GET /users/login
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// POST /users/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.render('login', { error: 'Please enter username and password.' });
  }

  db.query(
    'SELECT * FROM users WHERE username = ?',
    [username],
    async (err, results) => {
      if (err) {
        console.error('Error fetching user:', err);
        return res.render('login', { error: 'Database error.' });
      }

      if (results.length === 0) {
        return res.render('login', { error: 'Invalid username or password.' });
      }

      const user = results[0];

      try {
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
          return res.render('login', { error: 'Invalid username or password.' });
        }

        // Save to session
        req.session.user = {
          id: user.id,
          username: user.username,
          first: user.first,
          last: user.last
        };

        // After login, go to workouts list
        res.redirect('/workouts/list');
      } catch (e2) {
        console.error('Error comparing password:', e2);
        res.render('login', { error: 'Unexpected error.' });
      }
    }
  );
});

// GET /users/logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/users/login');
  });
});

module.exports = router;
