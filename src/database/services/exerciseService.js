import express from 'express';
import { CapacitorSQLite } from '@capacitor-community/sqlite';

const router = express.Router();
const dbName = 'fitpro.db';

// Initialize the database
const initializeDatabase = async () => {
  const db = await CapacitorSQLite.open({ database: dbName });
  await db.execute({
    statements: `
      CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        region TEXT,
        primary_muscle TEXT,
        secondary_muscle TEXT,
        notes TEXT
      );
    `,
  });
  console.log('Exercise table initialized.');
};

// Route to add an exercise
router.post('/add', async (req, res) => {
  try {
    const { name, region, primary_muscle, secondary_muscle, notes } = req.body;
    const db = await CapacitorSQLite.open({ database: dbName });

    await db.run({
      statement: `INSERT INTO exercises (name, region, primary_muscle, secondary_muscle, notes) VALUES (?, ?, ?, ?, ?);`,
      values: [name, region, primary_muscle, secondary_muscle, notes],
    });

    res.status(201).json({ message: 'Exercise added successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Error adding exercise' });
  }
});

// Route to get all exercises
router.get('/all', async (req, res) => {
  try {
    const db = await CapacitorSQLite.open({ database: dbName });
    const result = await db.query({
      statement: `SELECT * FROM exercises;`,
    });

    res.json(result.values || []);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching exercises' });
  }
});

// Route to delete an exercise
router.delete('/delete/:id', async (req, res) => {
  try {
    const db = await CapacitorSQLite.open({ database: dbName });
    await db.run({
      statement: `DELETE FROM exercises WHERE id = ?;`,
      values: [req.params.id],
    });

    res.json({ message: `Exercise with ID ${req.params.id} deleted.` });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting exercise' });
  }
});

// Initialize the database when the module is loaded
initializeDatabase();

export default router;
