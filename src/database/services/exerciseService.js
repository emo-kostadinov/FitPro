import db from '../database';

const createTable = () => {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS exercises (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, region TEXT, primary_muscle TEXT, secondary_muscle TEXT, notes TEXT)`,
          [],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      });
    });
};

// Add exercise to the database
export const addExercise = (exercise) => {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `INSERT INTO exercises (name, region, primary_muscle, secondary_muscle, notes) VALUES (?, ?, ?, ?, ?)`,
          [exercise.name, exercise.region, exercise.primary_muscle, exercise.secondary_muscle, exercise.notes],
          (_, result) => resolve(result.insertId),  // Resolve with the inserted exercise's ID
          (_, error) => {
            console.error('Error adding exercise:', error);
            reject(error);
          }
        );
      });
    });
  };
  
  // Get all exercises from the database
  export const getAllExercises = () => {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT * FROM exercises`,
          [],
          (_, { rows }) => resolve(rows._array),  // Resolve with the array of exercises
          (_, error) => {
            console.error('Error fetching exercises:', error);
            reject(error);
          }
        );
      });
    });
  };
  
  // Edit an existing exercise
  export const editExercise = (exercise) => {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `UPDATE exercises SET name = ?, region = ?, primary_muscle = ?, secondary_muscle = ?, notes = ? WHERE id = ?`,
          [exercise.name, exercise.region, exercise.primary_muscle, exercise.secondary_muscle, exercise.notes, exercise.id],
          (_, result) => resolve(result.rowsAffected),  // Resolve with the number of affected rows
          (_, error) => {
            console.error('Error editing exercise:', error);
            reject(error);
          }
        );
      });
    });
  };
  
  // Delete an exercise by ID
  export const deleteExercise = (id) => {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `DELETE FROM exercises WHERE id = ?`,
          [id],
          (_, result) => resolve(result.rowsAffected),  // Resolve with the number of rows deleted
          (_, error) => {
            console.error('Error deleting exercise:', error);
            reject(error);
          }
        );
      });
    });
  };
  