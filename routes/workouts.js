const express = require('express');
const router = express.Router();

// Middleware to require login
function requireLogin(req, res, next) {
  if (!req.session.user) {
    const basePath = req.app.locals.basePath || "";
    return res.redirect(`${basePath}/users/login`);
  }
  next();
}

// ---------------------------
// GET /workouts/list
// ---------------------------
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
        basePath,
        user: req.session.user
      });
    }
  );
});

// ---------------------------
// GET /workouts/add
// ---------------------------
router.get('/add', requireLogin, (req, res) => {
  const basePath = req.app.locals.basePath || "";
  res.render('workouts_add', {
    basePath,
    user: req.session.user
  });
});

// ---------------------------
// POST /workouts/add
// ---------------------------
router.post('/add', requireLogin, (req, res) => {
  const basePath = req.app.locals.basePath || "";
  const userId = req.session.user.id;

  const { workout_date, workout_type, duration_minutes, intensity, notes } = req.body;

  db.query(
    "INSERT INTO workouts (user_id, workout_date, workout_type, duration_minutes, intensity, notes) VALUES (?, ?, ?, ?, ?, ?)",
    [userId, workout_date, workout_type, duration_minutes, intensity, notes],
    (err) => {
      if (err) {
        console.error("Error inserting workout:", err);
        return res.send("Database error");
      }

      res.redirect(`${basePath}/workouts/list`);
    }
  );
});

// ---------------------------
// GET /workouts/edit/:id
// ---------------------------
router.get('/edit/:id', requireLogin, (req, res) => {
  const basePath = req.app.locals.basePath || "";
  const workoutId = req.params.id;

  db.query(
    "SELECT * FROM workouts WHERE id = ? AND user_id = ?",
    [workoutId, req.session.user.id],
    (err, results) => {
      if (err || results.length === 0) {
        return res.send("Workout not found.");
      }

      res.render('workouts_edit', {
        workout: results[0],
        basePath,
        user: req.session.user
      });
    }
  );
});

// ---------------------------
// POST /workouts/edit/:id
// ---------------------------
router.post('/edit/:id', requireLogin, (req, res) => {
  const basePath = req.app.locals.basePath || "";
  const workoutId = req.params.id;

  const { workout_date, workout_type, duration_minutes, intensity, notes } = req.body;

  db.query(
    "UPDATE workouts SET workout_date=?, workout_type=?, duration_minutes=?, intensity=?, notes=? WHERE id=? AND user_id=?",
    [workout_date, workout_type, duration_minutes, intensity, notes, workoutId, req.session.user.id],
    (err) => {
      if (err) {
        console.error("Error updating workout:", err);
        return res.send("Database error");
      }

      res.redirect(`${basePath}/workouts/list`);
    }
  );
});

// ---------------------------
// GET /workouts/delete/:id
// ---------------------------
router.get('/delete/:id', requireLogin, (req, res) => {
  const basePath = req.app.locals.basePath || "";
  const workoutId = req.params.id;

  db.query(
    "DELETE FROM workouts WHERE id = ? AND user_id = ?",
    [workoutId, req.session.user.id],
    (err) => {
      if (err) {
        console.error("Error deleting workout:", err);
        return res.send("Database error");
      }

      res.redirect(`${basePath}/workouts/list`);
    }
  );
});

// ---------------------------
// GET /workouts/search
// ---------------------------
router.get('/search', requireLogin, (req, res) => {
  const basePath = req.app.locals.basePath || "";
  const userId = req.session.user.id;
  const query = `%${req.query.q || ""}%`;

  db.query(
    "SELECT * FROM workouts WHERE user_id = ? AND workout_type LIKE ? ORDER BY workout_date DESC",
    [userId, query],
    (err, results) => {
      if (err) {
        console.error("Error searching workouts:", err);
        return res.send("Database error");
      }

      res.render('workouts_search', {
        workouts: results,
        q: req.query.q || "",
        basePath,
        user: req.session.user
      });
    }
  );
});

module.exports = router;