import { CapacitorSQLite } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

const dbName = 'fitpro.db';

// Helper function to check if the platform is web
const isWebPlatform = () => Capacitor.getPlatform() === 'web';

// Initialize the database and create tables
export const initializeDatabase = async () => {
  try {
    if (isWebPlatform()) {
      console.warn('SQLite is not supported on the web. Skipping database initialization.');
      return;
    }

    const db = await CapacitorSQLite.open({ database: dbName });
    console.log('Database opened successfully.');

    // Create tables
    await db.execute({
      statements: `
        CREATE TABLE IF NOT EXISTS workouts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          archived INTEGER DEFAULT 0
        );
      `,
    });
    console.log('Tables created or already exist.');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Add a workout
export const addWorkout = async (workout) => {
  try {
    if (isWebPlatform()) {
      console.warn('SQLite is not supported on the web. Add functionality is disabled.');
      return;
    }
    const db = await CapacitorSQLite.open({ database: dbName });
    await db.run({
      statement: `INSERT INTO workouts (name, archived) VALUES (?, ?)`,
      values: [workout.name, workout.archived || 0],
    });
    console.log('Workout added successfully:', workout.name);
  } catch (error) {
    console.error('Error adding workout:', error);
    throw error;
  }
};

// Fetch all workouts
export const getAllWorkouts = async () => {
  try {
    if (isWebPlatform()) {
      console.warn('SQLite is not supported on the web. Returning mock data.');
      return [];
    }
    const db = await CapacitorSQLite.open({ database: dbName });
    const result = await db.query({
      statement: `SELECT * FROM workouts;`,
    });
    console.log('Fetched workouts:', result);
    return result.values || [];
  } catch (error) {
    console.error('Error fetching workouts:', error);
    throw error;
  }
};

// Delete a workout by ID
export const deleteWorkout = async (id) => {
  try {
    if (isWebPlatform()) {
      console.warn('SQLite is not supported on the web. Delete functionality is disabled.');
      return;
    }
    const db = await CapacitorSQLite.open({ database: dbName });
    await db.run({
      statement: `DELETE FROM workouts WHERE id = ?;`,
      values: [id],
    });
    console.log(`Workout with ID ${id} deleted.`);
  } catch (error) {
    console.error('Error deleting workout:', error);
    throw error;
  }
};
