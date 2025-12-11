const express = require('express');
const router = express.Router();

// Middleware to ensure user is logged in
function requireLogin(req, res, next) {
  if (!req.session.user) {
    const basePath = req.app.locals.basePath || "";
    return res.redirect(`${basePath}/users/login`);
  }
  next();
}

// ------------------------------------------------------------
// LIST WORKOUTS
// ------------------------------------------------------------
router.get('/list', requireLogin, (req, res) => {
  const basePath = req.app.locals.basePath || "";
  const userId = req.session.user.id;

  db.query(
    "SELECT * FROM workouts WHERE user_id = ? ORDER BY workout_date DESC",
    [userId],
    (err, results) => {
      if (err) {
        console.error("Error fetching workouts:", err);
        return res.render('workouts_list', {
          workouts: [],
          basePath,
          user: req.session.user,
          error: "Could not load workouts from database."
        });
      }

      res.render('workouts_list', {
        workouts: results,
        basePath,
        user: req.session.user,
        error: null
      });
    }
  );
});

// ------------------------------------------------------------
// ADD WORKOUT FORM
// ------------------------------------------------------------
router.get('/add', requireLogin, (req, res) => {
  const basePath = req.app.locals.basePath || "";
  res.render('workouts_add', {
    basePath,
    user: req.session.user,
    error: null
  });
});

// ------------------------------------------------------------
// ADD WORKOUT (POST)
// ------------------------------------------------------------
router.post('/add', requireLogin, (req, res) => {
  const basePath = req.app.locals.basePath || "";
  const userId = req.session.user.id;

  const { date, type, duration, intensity, notes } = req.body;

  db.query(
    "INSERT INTO workouts (user_id, workout_date, workout_type, duration_minutes, intensity, notes) VALUES (?, ?, ?, ?, ?, ?)",
    [userId, date, type, duration, intensity, notes],
    (err) => {
      if (err) {
        console.error("Error inserting workout:", err);
        return res.render('workouts_add', {
          basePath,
          user: req.session.user,
          error: "Could not save workout. Check your input."
        });
      }
      res.redirect(`${basePath}/workouts/list`);
    }
  );
});

// ------------------------------------------------------------
// EDIT WORKOUT (FORM)
// ------------------------------------------------------------
router.get('/edit/:id', requireLogin, (req, res) => {
  const basePath = req.app.locals.basePath || "";
  const id = req.params.id;

  db.query(
    "SELECT * FROM workouts WHERE id = ? AND user_id = ?",
    [id, req.session.user.id],
    (err, results) => {
      if (err || results.length === 0) {
        return res.send("Workout not found.");
      }

      res.render('workouts_edit', {
        workout: results[0],
        basePath,
        user: req.session.user,
        error: null
      });
    }
  );
});

// ------------------------------------------------------------
// UPDATE WORKOUT (POST)
// ------------------------------------------------------------
router.post('/edit/:id', requireLogin, (req, res) => {
  const basePath = req.app.locals.basePath || "";
  const id = req.params.id;

  const { date, type, duration, intensity, notes } = req.body;

  db.query(
    "UPDATE workouts SET workout_date=?, workout_type=?, duration_minutes=?, intensity=?, notes=? WHERE id=? AND user_id=?",
    [date, type, duration, intensity, notes, id, req.session.user.id],
    (err) => {
      if (err) {
        console.error("Error updating workout:", err);
        return res.send("Update failed.");
      }

      res.redirect(`${basePath}/workouts/list`);
    }
  );
});

// ------------------------------------------------------------
// DELETE WORKOUT
// ------------------------------------------------------------
router.get('/delete/:id', requireLogin, (req, res) => {
  const basePath = req.app.locals.basePath || "";
  const id = req.params.id;

  db.query(
    "DELETE FROM workouts WHERE id=? AND user_id=?",
    [id, req.session.user.id],
    (err) => {
      if (err) {
        console.error("Error deleting workout:", err);
        return res.send("Delete failed.");
      }

      res.redirect(`${basePath}/workouts/list`);
    }
  );
});

// ------------------------------------------------------------
// SEARCH WORKOUTS
// ------------------------------------------------------------
router.get('/search', requireLogin, (req, res) => {
  const basePath = req.app.locals.basePath || "";
  const userId = req.session.user.id;
  const q = `%${req.query.q || ""}%`;

  db.query(
    "SELECT * FROM workouts WHERE user_id = ? AND (workout_type LIKE ? OR notes LIKE ?) ORDER BY workout_date DESC",
    [userId, q, q],
    (err, results) => {
      if (err) {
        console.error("Search error:", err);
        return res.render('workouts_list', {
          workouts: [],
          basePath,
          user: req.session.user,
          error: "Search failed."
        });
      }

      res.render('workouts_list', {
        workouts: results,
        basePath,
        user: req.session.user,
        error: null
      });
    }
  );
});

module.exports = router;
