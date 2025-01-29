import { CapacitorSQLite } from '@capacitor-community/sqlite';

const dbName = 'fitpro.db';

export const addWorkout = async (workout) => {
  try {
    const db = await CapacitorSQLite.open({ database: dbName });
    await db.execute({
      statements: `INSERT INTO workouts (name, archived) VALUES (?, ?);`,
      values: [workout.name, workout.archived],
    });
    console.log('Workout added successfully:', workout.name);
  } catch (error) {
    console.error('Error adding workout:', error);
    throw error;
  }
};

export const getAllWorkouts = async () => {
  try {
    const db = await CapacitorSQLite.open({ database: dbName });
    const result = await db.query({
      statement: `SELECT * FROM workouts;`,
    });
    return result.values || [];
  } catch (error) {
    console.error('Error fetching workouts:', error);
    throw error;
  }
};

export const deleteWorkout = async (id) => {
  try {
    const db = await CapacitorSQLite.open({ database: dbName });
    await db.execute({
      statements: `DELETE FROM workouts WHERE id = ?;`,
      values: [id],
    });
    console.log(`Workout with ID ${id} deleted.`);
  } catch (error) {
    console.error('Error deleting workout:', error);
    throw error;
  }
};
