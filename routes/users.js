// routes/users.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../db");

const saltRounds = 10;

// ------------------------
// SHOW LOGIN PAGE
// ------------------------
router.get("/login", (req, res) => {
  res.render("login.ejs", { error: null });
});

// ------------------------
// HANDLE LOGIN
// ------------------------
router.post("/login", (req, res, next) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.render("login.ejs", {
      error: "Please enter both username and password."
    });
  }

  const sql = "SELECT * FROM users WHERE username = ?";

  db.query(sql, [username], (err, results) => {
    if (err) return next(err);

    if (results.length === 0) {
      return res.render("login.ejs", {
        error: "User not found."
      });
    }

    const user = results[0];

    bcrypt.compare(password, user.password, (err, match) => {
      if (err) return next(err);

      if (!match) {
        return res.render("login.ejs", {
          error: "Incorrect password."
        });
      }

      // Save logged-in user in session
      req.session.userId = user.id;
      req.session.username = user.username;

      res.redirect("/workouts");
    });
  });
});

// ------------------------
// LOGOUT
// ------------------------
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// ------------------------
// SHOW REGISTER PAGE
// ------------------------
router.get("/register", (req, res) => {
  res.render("register.ejs", { error: null, formData: {} });
});

// ------------------------
// HANDLE REGISTER
// ------------------------
router.post("/register", (req, res, next) => {
  const { first, last, email, username, password, confirm } = req.body || {};
  const formData = { first, last, email, username };

  // Basic validation
  if (!first || !last || !email || !username || !password || !confirm) {
    return res.render("register.ejs", {
      error: "Please fill in all fields.",
      formData
    });
  }

  if (password !== confirm) {
    return res.render("register.ejs", {
      error: "Passwords do not match.",
      formData
    });
  }

  // Check username not already taken
  const checkSql = "SELECT id FROM users WHERE username = ?";

  db.query(checkSql, [username], (err, results) => {
    if (err) return next(err);

    if (results.length > 0) {
      return res.render("register.ejs", {
        error: "That username is already in use.",
        formData
      });
    }

    // Hash password and insert
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) return next(err);

      const insertSql = `
        INSERT INTO users (first, last, email, username, password)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(
        insertSql,
        [first, last, email, username, hash],
        (err, result) => {
          if (err) return next(err);

          // Auto-login after registration
          req.session.userId = result.insertId;
          req.session.username = username;

          res.redirect("/workouts");
        }
      );
    });
  });
});

module.exports = router;
