USE health;

-- Example users (passwords can be empty for now except gold)
INSERT INTO users (first, last, email, username, password) VALUES
('Alice', 'Runner', 'alice@example.com', 'alice', ''),
('Bob', 'Lifter', 'bob@example.com', 'bob', '');

-- GOLD user for markers – paste your bcrypt hash for smiths123ABC$ here
INSERT INTO users (first, last, email, username, password) VALUES
('Gold', 'Marker', 'gold@example.com', 'gold', '$2b$10$3Zyu51NK1o05hQSNArz82.LmkfGzci4TUNfdfw9vZerbmsW.QyKNG');

-- Sample workouts
INSERT INTO workouts (user_id, workout_date, workout_type, duration_minutes, intensity, notes) VALUES
(1, '2025-02-01', 'Running', 30, 'medium', 'Easy jog'),
(1, '2025-02-03', 'Gym', 45, 'high', 'Leg day'),
(2, '2025-02-02', 'Cycling', 60, 'medium', 'Indoor bike'),
(2, '2025-02-04', 'Yoga', 40, 'low', 'Stretching session');
