//routes/workouts.js
const express = require("express");
const router = express.Router();
const db = require("../db");


const redirectLogin = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.redirect("/users/login");
  }
  next();
};


function listWorkouts(req, res, next) {
  const userId = req.session.userId;

  const sql = `
    SELECT * FROM workouts
    WHERE user_id = ?
    ORDER BY workout_date DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) return next(err);
    res.render("workouts_list.ejs", { workouts: results });
  });
}

router.get("/", redirectLogin, listWorkouts);
router.get("/list", redirectLogin, listWorkouts);

//Show add workout form
router.get("/add", redirectLogin, (req, res) => {
  res.render("workouts_add.ejs", { error: null, formData: {} });
});

//Handle add workout 
router.post("/add", redirectLogin, (req, res, next) => {
  const userId = req.session.userId;
  const body = req.body || {};

  let { workout_date, workout_type, duration_minutes, intensity, notes } = body;

  // sanitise
  if (req.sanitize) {
    workout_type = req.sanitize(workout_type);
    intensity = req.sanitize(intensity);
    notes = req.sanitize(notes || "");
  }

  // basic validation
  if (!workout_date || !workout_type || !duration_minutes) {
    return res.render("workouts_add.ejs", {
      error: "Date, type and duration are required.",
      formData: body,
    });
  }

  const sql = `
    INSERT INTO workouts (user_id, workout_date, workout_type, duration_minutes, intensity, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const params = [
    userId,
    workout_date,
    workout_type,
    duration_minutes,
    intensity || null,
    notes || null,
  ];

  db.query(sql, params, (err) => {
    if (err) return next(err);
    res.redirect("/workouts");
  });
});

// --------- SHOW edit workout form ----------
router.get("/edit/:id", redirectLogin, (req, res, next) => {
  const workoutId = req.params.id;
  const userId = req.session.userId;

  const sql = `SELECT * FROM workouts WHERE id = ? AND user_id = ?`;

  db.query(sql, [workoutId, userId], (err, results) => {
    if (err) return next(err);
    if (results.length === 0) {
      return res.send("Workout not found.");
    }
    res.render("workouts_edit.ejs", { workout: results[0], error: null });
  });
});

// --------- HANDLE edit workout ----------
router.post("/edit/:id", redirectLogin, (req, res, next) => {
  const workoutId = req.params.id;
  const userId = req.session.userId;
  const body = req.body || {};

  let { workout_date, workout_type, duration_minutes, intensity, notes } = body;

  if (req.sanitize) {
    workout_type = req.sanitize(workout_type);
    intensity = req.sanitize(intensity);
    notes = req.sanitize(notes || "");
  }

  const sql = `
    UPDATE workouts
    SET workout_date = ?, workout_type = ?, duration_minutes = ?, intensity = ?, notes = ?
    WHERE id = ? AND user_id = ?
  `;

  const params = [
    workout_date,
    workout_type,
    duration_minutes,
    intensity || null,
    notes || null,
    workoutId,
    userId,
  ];

  db.query(sql, params, (err) => {
    if (err) return next(err);
    res.redirect("/workouts");
  });
});

// --------- DELETE workout ----------
router.get("/delete/:id", redirectLogin, (req, res, next) => {
  const workoutId = req.params.id;
  const userId = req.session.userId;

  const sql = `DELETE FROM workouts WHERE id = ? AND user_id = ?`;

  db.query(sql, [workoutId, userId], (err) => {
    if (err) return next(err);
    res.redirect("/workouts");
  });
});

module.exports = router;
