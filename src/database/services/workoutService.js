import express from 'express';
import { CapacitorSQLite } from '@capacitor-community/sqlite';

const router = express.Router();
const dbName = 'fitpro.db';

// Initialize the database
const initializeDatabase = async () => {
  const db = await CapacitorSQLite.open({ database: dbName });
  await db.execute({
    statements: `
      CREATE TABLE IF NOT EXISTS workouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        archived INTEGER DEFAULT 0
      );
    `,
  });
  console.log('Workout table initialized.');
};

// Route to add a workout
router.post('/add', async (req, res) => {
  try {
    const { name, archived } = req.body;
    const db = await CapacitorSQLite.open({ database: dbName });

    await db.run({
      statement: `INSERT INTO workouts (name, archived) VALUES (?, ?);`,
      values: [name, archived],
    });

    res.status(201).json({ message: 'Workout added successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Error adding workout' });
  }
});

// Route to get all workouts
router.get('/all', async (req, res) => {
  try {
    const db = await CapacitorSQLite.open({ database: dbName });
    const result = await db.query({
      statement: `SELECT * FROM workouts;`,
    });

    res.json(result.values || []);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching workouts' });
  }
});

// Route to delete a workout
router.delete('/delete/:id', async (req, res) => {
  try {
    const db = await CapacitorSQLite.open({ database: dbName });
    await db.run({
      statement: `DELETE FROM workouts WHERE id = ?;`,
      values: [req.params.id],
    });

    res.json({ message: `Workout with ID ${req.params.id} deleted.` });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting workout' });
  }
});

// Initialize the database when the module is loaded
initializeDatabase();

export default router;
