// src/database/database.js
import { CapacitorSQLite } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

const dbName = 'fitpro.db';

// Helper function to check if the platform is web
export const isWebPlatform = () => Capacitor.getPlatform() === 'web';

// Function to initialize the database
export const initializeDatabase = async () => {
  try {
    console.log('Initializing database...');
    if (isWebPlatform()) {
      console.log('Running on web platform. Skipping SQLite initialization.');
      return;
    }

    // Initialize SQLite for native platforms
    const db = await CapacitorSQLite.open({ database: dbName });
    console.log('Database opened successfully.');

    // Create tables if they don't exist
    await db.execute({
      statements: `
        CREATE TABLE IF NOT EXISTS profiles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId TEXT NOT NULL,
          name TEXT NOT NULL,
          age INTEGER,
          height REAL,
          weight REAL
        );

        CREATE TABLE IF NOT EXISTS workouts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          archived INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS exercises (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          primary_muscle_group TEXT,
          secondary_muscle_group TEXT,
          notes TEXT
        );

        CREATE TABLE IF NOT EXISTS workout_exercises (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          workout_id INTEGER,
          exercise_id INTEGER,
          sets INTEGER,
          reps INTEGER,
          weight REAL,
          notes TEXT,
          FOREIGN KEY (workout_id) REFERENCES workouts(id),
          FOREIGN KEY (exercise_id) REFERENCES exercises(id)
        );

        CREATE TABLE IF NOT EXISTS logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          workout_exercise_id INTEGER,
          date DATETIME DEFAULT CURRENT_TIMESTAMP,
          sets INTEGER,
          reps INTEGER,
          weight REAL,
          notes TEXT,
          FOREIGN KEY (workout_exercise_id) REFERENCES workout_exercises(id)
        );
      `,
    });

    console.log('Tables created or already exist.');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Save profile data
export const saveProfile = async (userId, profileData) => {
  if (isWebPlatform()) {
    // Fallback to localStorage for web
    localStorage.setItem(`profile_${userId}`, JSON.stringify(profileData));
    console.log('Profile saved to localStorage.');
  } else {
    // Use SQLite for native platforms
    const db = await CapacitorSQLite.open({ database: dbName });
    await db.run({
      statement: `
        INSERT INTO profiles (userId, name, age, height, weight)
        VALUES (?, ?, ?, ?, ?);
      `,
      values: [userId, profileData.name, profileData.age, profileData.height, profileData.weight],
    });
    console.log('Profile saved to SQLite.');
  }
};

// Fetch profile data
export const getProfile = async (userId) => {
  if (isWebPlatform()) {
    // Fallback to localStorage for web
    const profile = localStorage.getItem(`profile_${userId}`);
    return profile ? JSON.parse(profile) : null;
  } else {
    // Use SQLite for native platforms
    const db = await CapacitorSQLite.open({ database: dbName });
    const result = await db.query({
      statement: `SELECT * FROM profiles WHERE userId = ?;`,
      values: [userId],
    });
    return result.values?.[0] || null;
  }
};

// Function to add a workout
export const addWorkout = async (workout) => {
  if (isWebPlatform()) {
    // Fallback to localStorage for web
    const workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
    workouts.push({ ...workout, id: Date.now() });
    localStorage.setItem('workouts', JSON.stringify(workouts));
    console.log('Workout added to localStorage:', workout.name);
  } else {
    // Use SQLite for native platforms
    const db = await CapacitorSQLite.open({ database: dbName });
    await db.run({
      statement: `INSERT INTO workouts (name, archived) VALUES (?, ?);`,
      values: [workout.name, workout.archived || 0],
    });
    console.log('Workout added to SQLite:', workout.name);
  }
};

// Function to fetch all workouts
export const getAllWorkouts = async () => {
  if (isWebPlatform()) {
    // Fallback to localStorage for web
    const workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
    console.log('Fetched workouts from localStorage:', workouts);
    return workouts;
  } else {
    // Use SQLite for native platforms
    const db = await CapacitorSQLite.open({ database: dbName });
    const result = await db.query({
      statement: `SELECT * FROM workouts;`,
    });
    console.log('Fetched workouts from SQLite:', result.values);
    return result.values || [];
  }
};

// Function to delete a workout
export const deleteWorkout = async (id) => {
  if (isWebPlatform()) {
    // Fallback to localStorage for web
    const workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
    const updatedWorkouts = workouts.filter((workout) => workout.id !== id);
    localStorage.setItem('workouts', JSON.stringify(updatedWorkouts));
    console.log(`Workout with ID ${id} deleted from localStorage.`);
  } else {
    // Use SQLite for native platforms
    const db = await CapacitorSQLite.open({ database: dbName });
    await db.run({
      statement: `DELETE FROM workouts WHERE id = ?;`,
      values: [id],
    });
    console.log(`Workout with ID ${id} deleted from SQLite.`);
  }
};

// Function to add an exercise
export const addExercise = async (exercise) => {
  if (isWebPlatform()) {
    // Fallback to localStorage for web
    const exercises = JSON.parse(localStorage.getItem('exercises') || '[]');
    exercises.push({ ...exercise, id: Date.now() });
    localStorage.setItem('exercises', JSON.stringify(exercises));
    console.log('Exercise added to localStorage:', exercise.name);
  } else {
    // Use SQLite for native platforms
    const db = await CapacitorSQLite.open({ database: dbName });
    await db.run({
      statement: `INSERT INTO exercises (name, primary_muscle_group, secondary_muscle_group, notes) VALUES (?, ?, ?, ?);`,
      values: [exercise.name, exercise.primary_muscle_group, exercise.secondary_muscle_group, exercise.notes],
    });
    console.log('Exercise added to SQLite:', exercise.name);
  }
};

// Function to fetch all exercises
export const getAllExercises = async () => {
  if (isWebPlatform()) {
    // Fallback to localStorage for web
    const exercises = JSON.parse(localStorage.getItem('exercises') || '[]');
    console.log('Fetched exercises from localStorage:', exercises);
    return exercises;
  } else {
    // Use SQLite for native platforms
    const db = await CapacitorSQLite.open({ database: dbName });
    const result = await db.query({
      statement: `SELECT * FROM exercises;`,
    });
    console.log('Fetched exercises from SQLite:', result.values);
    return result.values || [];
  }
};

// Function to add a workout exercise
export const addWorkoutExercise = async (workoutExercise) => {
  if (isWebPlatform()) {
    // Fallback to localStorage for web
    const workoutExercises = JSON.parse(localStorage.getItem('workout_exercises') || '[]');
    workoutExercises.push({ ...workoutExercise, id: Date.now() });
    localStorage.setItem('workout_exercises', JSON.stringify(workoutExercises));
    console.log('Workout exercise added to localStorage.');
  } else {
    // Use SQLite for native platforms
    const db = await CapacitorSQLite.open({ database: dbName });
    await db.run({
      statement: `INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, notes) VALUES (?, ?, ?, ?, ?, ?);`,
      values: [
        workoutExercise.workout_id,
        workoutExercise.exercise_id,
        workoutExercise.sets,
        workoutExercise.reps,
        workoutExercise.weight,
        workoutExercise.notes,
      ],
    });
    console.log('Workout exercise added to SQLite.');
  }
};

// Function to fetch all logs for a workout exercise
export const getLogsForWorkoutExercise = async (workoutExerciseId) => {
  if (isWebPlatform()) {
    // Fallback to localStorage for web
    const logs = JSON.parse(localStorage.getItem('logs') || '[]');
    const filteredLogs = logs.filter((log) => log.workout_exercise_id === workoutExerciseId);
    console.log('Fetched logs from localStorage:', filteredLogs);
    return filteredLogs;
  } else {
    // Use SQLite for native platforms
    const db = await CapacitorSQLite.open({ database: dbName });
    const result = await db.query({
      statement: `SELECT * FROM logs WHERE workout_exercise_id = ?;`,
      values: [workoutExerciseId],
    });
    console.log('Fetched logs from SQLite:', result.values);
    return result.values || [];
  }
};