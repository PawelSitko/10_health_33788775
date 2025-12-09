--Drop and recreate database
DROP DATABASE IF EXISTS health;
CREATE DATABASE health;
USE health;

--Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first VARCHAR(50),
  last VARCHAR(50),
  email VARCHAR(100),
  username VARCHAR(50) UNIQUE,
  password VARCHAR(255)
);

--Workouts table
CREATE TABLE workouts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  workout_date DATE NOT NULL,
  workout_type VARCHAR(50) NOT NULL,
  duration_minutes INT NOT NULL,
  intensity ENUM('low', 'medium', 'high') NOT NULL,
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
