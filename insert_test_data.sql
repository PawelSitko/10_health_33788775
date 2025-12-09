USE health;

--Some normal users with placeholder passwords
INSERT INTO users (first, last, email, username, password) VALUES
('Alice', 'Runner', 'alice@example.com', 'alice', ''),
('Bob', 'Lifter', 'bob@example.com', 'bob', '');

--You must replace <HASH_GOES_HERE> with a bcrypt hash of the chosen password
INSERT INTO users (first, last, email, username, password) VALUES
('Gold', 'Marker', 'gold@example.com', 'gold', '$2b$10$GfH7oqgnTkGQgsWIedO4rO7ibW1W6..ttqJhBy.3qbWV/cADe7FpG');

--Sample workouts
INSERT INTO workouts (user_id, workout_date, workout_type, duration_minutes, intensity, notes) VALUES
(1, '2025-02-01', 'Running', 30, 'medium', 'Easy jog around the park'),
(1, '2025-02-03', 'Gym', 45, 'high', 'Leg day'),
(2, '2025-02-02', 'Cycling', 60, 'medium', 'Indoor bike session'),
(2, '2025-02-04', 'Yoga', 40, 'low', 'Stretch and relax');
