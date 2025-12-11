// routes/workouts.js
const express = require('express');
const router = express.Router();

// Middleware: check if user is logged in
function requireLogin(req, res, next) {
  if (!req.session.user) {
    const basePath = req.app.locals.basePath || "";
    return res.redirect(`${basePath}/users/login`);
  }
  next();
}

// GET /workouts/list
router.get('/list', requireLogin, (req, res) => {
  const basePath = req.app.locals.basePath || "";
  const userId = req.session.user.id;

  db.query(
    "SELECT * FROM workouts WHERE user_id = ? ORDER BY workout_date DESC",
    [userId],
    (err, results) => {
      if (err) {
        console.error("Error fetching workouts:", err);
        return res.send("Database error");
      }

      res.render('workouts_list', {
        workouts: results,
        basePath
      });
    }
  );
});

// GET /workouts/add
router.get('/add', requireLogin, (req, res) => {
  const basePath = req.app.locals.basePath || "";
  res.render('workouts_add', { error: null, basePath });
});

// POST /workouts/add
router.post('/add', requireLogin, (req, res) => {
  const basePath = req.app.locals.basePath || "";
  const userId = req.session.user.id;

  const {
    workout_date,
    workout_type,
    duration_minutes,
    intensity,
    notes
  } = req.body;

  if (!workout_date || !workout_type || !duration_minutes || !intensity) {
    return res.render("workouts_add", {
      error: "Please fill all required fields.",
      basePath
    });
  }

  db.query(
    `INSERT INTO workouts
      (user_id, workout_date, workout_type, duration_minutes, intensity, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      userId,
      workout_date,
      workout_type,
      duration_minutes,
      intensity,
      notes || null
    ],
    (err) => {
      if (err) {
        console.error("Error inserting workout:", err);
        return res.render("workouts_add", {
          error: "Database error.",
          basePath
        });
      }

      res.redirect(`${basePath}/workouts/list`);
    }
  );
});

module.exports = router;
