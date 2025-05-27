import { CapacitorSQLite } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { exerciseSchema } from '../validations/validationSchemas';
import { getAuth } from 'firebase/auth';

const dbName = 'fitpro.db';

// Helper function to check if the platform is web
export const isWebPlatform = () => Capacitor.getPlatform() === 'web';

// Function to initialize the database
export const initializeDatabase = async () => {
  try {
    console.log('Initializing database...');
    if (isWebPlatform()) {
      console.log('Running on web platform. Initializing localStorage...');
      // Initialize empty arrays for user-specific data if they don't exist
      const userId = getAuth()?.currentUser?.uid;
      if (userId) {
        if (!localStorage.getItem(`workouts_${userId}`)) {
          localStorage.setItem(`workouts_${userId}`, '[]');
        }
        if (!localStorage.getItem(`exercises_${userId}`)) {
          localStorage.setItem(`exercises_${userId}`, '[]');
        }
      }
      return;
    }

    // Initialize SQLite for native platforms
    const db = await CapacitorSQLite.open({ database: dbName });
    console.log('Database opened successfully.');

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
          userId TEXT NOT NULL,
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
          set_type TEXT,  -- e.g., "Warm-up", "Pyramid", "Main Set"
          FOREIGN KEY (workout_id) REFERENCES workouts(id),
          FOREIGN KEY (exercise_id) REFERENCES exercises(id)
        );

        CREATE TABLE IF NOT EXISTS logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          workout_id INTEGER,
          workout_exercise_id INTEGER,
          date DATETIME DEFAULT CURRENT_TIMESTAMP,
          sets INTEGER,
          reps INTEGER,
          weight REAL,
          notes TEXT,
          FOREIGN KEY (workout_id) REFERENCES workouts(id),
          FOREIGN KEY (workout_exercise_id) REFERENCES workout_exercises(id)
        );

        CREATE TABLE IF NOT EXISTS biometric_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId TEXT NOT NULL,
          date DATETIME DEFAULT CURRENT_TIMESTAMP,
          height REAL,
          weight REAL
        );`
    });  

    console.log('Tables created or already exist.');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export const saveProfile = async (userId, profileData) => {
  if (isWebPlatform()) {
    localStorage.setItem(`profile_${userId}`, JSON.stringify(profileData));
    console.log('Profile saved to localStorage.');
  } else {
    const db = await CapacitorSQLite.open({ database: dbName });

    // Check if profile exists
    const result = await db.query({
      statement: "SELECT * FROM profiles WHERE userId = ?;",
      values: [userId],
    });

    if (result.values?.length > 0) {
      await db.run({
        statement: "UPDATE profiles SET name = ?, age = ? WHERE userId = ?;",
        values: [profileData.name, profileData.age, userId],
      });
      console.log('Profile updated in SQLite.');
    } else {
      await db.run({
        statement: "INSERT INTO profiles (userId, name, age) VALUES (?, ?, ?);",
        values: [userId, profileData.name, profileData.age],
      });
      console.log('Profile inserted in SQLite.');
    }
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
      statement: "SELECT * FROM profiles WHERE userId = ?;",
      values: [userId],
    });
    return result.values?.[0] || null;
  }
};

// Function to add a workout
export const addWorkout = async (workout) => {
  if (isWebPlatform()) {
    // Fallback to localStorage for web
    const workouts = JSON.parse(localStorage.getItem(`workouts_${workout.userId}`) || '[]');
    workouts.push({ ...workout, id: Date.now() });
    localStorage.setItem(`workouts_${workout.userId}`, JSON.stringify(workouts));
    console.log('Workout added to localStorage:', workout.name);
  } else {
    // Use SQLite for native platforms
    const db = await CapacitorSQLite.open({ database: dbName });
    await db.run({
      statement: "INSERT INTO workouts (userId, name, archived) VALUES (?, ?, ?);",
      values: [workout.userId, workout.name, workout.archived || 0],
    });
    console.log('Workout added to SQLite:', workout.name);
  }
};

// Function to fetch all workouts
export const getAllWorkouts = async (userId) => {
  if (isWebPlatform()) {
    // Fallback to localStorage for web
    const workouts = JSON.parse(localStorage.getItem(`workouts_${userId}`) || '[]');
    console.log('Fetched workouts from localStorage:', workouts);
    return workouts;
  } else {
    // Use SQLite for native platforms
    const db = await CapacitorSQLite.open({ database: dbName });
    const result = await db.query({
      statement: "SELECT * FROM workouts WHERE userId = ?;",
      values: [userId]
    });
    console.log('Fetched workouts from SQLite:', result.values);
    return result.values || [];
  }
};

// Function to fetch a workout by ID
export const getWorkoutById = async (workoutId, userId) => {
  if (isWebPlatform()) {
    // Fallback to localStorage for web
    const workouts = JSON.parse(localStorage.getItem(`workouts_${userId}`) || '[]');
    return workouts.find((workout) => workout.id === parseInt(workoutId, 10)) || null;
  } else {
    // Use SQLite for native platforms
    const db = await CapacitorSQLite.open({ database: dbName });
    const result = await db.query({
      statement: "SELECT * FROM workouts WHERE id = ? AND userId = ?;",
      values: [workoutId, userId],
    });
    return result.values?.[0] || null;
  }
};

// Function to delete a workout
export const deleteWorkout = async (id, userId) => {
  if (isWebPlatform()) {
    // Fallback to localStorage for web
    const workouts = JSON.parse(localStorage.getItem(`workouts_${userId}`) || '[]');
    const updatedWorkouts = workouts.filter((workout) => workout.id !== id);
    localStorage.setItem(`workouts_${userId}`, JSON.stringify(updatedWorkouts));
    console.log(`Workout with ID ${id} deleted from localStorage.`);
  } else {
    // Use SQLite for native platforms
    const db = await CapacitorSQLite.open({ database: dbName });
    await db.run({
      statement: "DELETE FROM workouts WHERE id = ? AND userId = ?;",
      values: [id, userId],
    });
    console.log(`Workout with ID ${id} deleted from SQLite.`);
  }
};

// Function to add an exercise
export const addExercise = async (userId, exercise) => {
  try {
    // Validate first
    await exerciseSchema.validate(exercise, { abortEarly: false });

    if (isWebPlatform()) {
      const exercises = JSON.parse(localStorage.getItem(`exercises_${userId}`) || '[]');
      exercises.push({ ...exercise, id: Date.now(), userId });
      localStorage.setItem(`exercises_${userId}`, JSON.stringify(exercises));
      return;
    }

    const db = await CapacitorSQLite.open({ database: dbName });
    await db.run({
      statement: `
        INSERT INTO exercises 
        (userId, name, primary_muscle_group, secondary_muscle_group, notes) 
        VALUES (?, ?, ?, ?, ?)
      `,
      values: [
        userId,
        exercise.name,
        exercise.primary_muscle_group,
        exercise.secondary_muscle_group || null,
        exercise.notes || null
      ]
    });
  } catch (error) {
    console.error('Validation or DB error:', error);
    throw error;
  }
};

// Function to fetch all exercises
export const getAllExercises = async (userId) => {
  if (isWebPlatform()) {
    // Fix: Initialize empty array if no exercises exist
    return JSON.parse(localStorage.getItem(`exercises_${userId}`) || '[]');
  }

  const db = await CapacitorSQLite.open({ database: dbName });
  const result = await db.query({
    statement: "SELECT * FROM exercises;"
  });
  return result.values || [];
};

// Helper function to group exercises by muscle group
export const groupExercisesByMuscle = (exercises) => {
  const grouped = exercises.reduce((acc, exercise) => {
    const group = exercise.primary_muscle_group || 'Other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(exercise);
    return acc;
  }, {});

  console.log("Grouped exercises:", grouped);
  return grouped;
};

// Function to delete an exercise
export const deleteExercise = async (userId, exerciseId) => {
  if (isWebPlatform()) {
    const exercises = JSON.parse(localStorage.getItem(`exercises_${userId}`) || []);
    const updated = exercises.filter(e => e.id !== exerciseId);
    localStorage.setItem(`exercises_${userId}`, JSON.stringify(updated));
    return;
  }

  const db = await CapacitorSQLite.open({ database: dbName });
  await db.run({
    statement: "DELETE FROM exercises WHERE id = ? AND userId = ?",
    values: [exerciseId, userId]
  });
};

// Function to add a workout exercise
export const addWorkoutExercise = async (workoutExercise) => {
  try {
    if (isWebPlatform()) {
      const workoutExercises = JSON.parse(localStorage.getItem('workout_exercises') || '[]');
      const exercises = JSON.parse(localStorage.getItem(`exercises_${getAuth().currentUser?.uid}`) || '[]');
      
      // Verify the exercise exists before adding
      const exercise = exercises.find(e => parseInt(e.id, 10) === parseInt(workoutExercise.exercise_id, 10));
      if (!exercise) {
        throw new Error(`Exercise with ID ${workoutExercise.exercise_id} not found`);
      }

      const newExercise = {
        ...workoutExercise,
        id: Date.now(),
        exercise_id: parseInt(workoutExercise.exercise_id, 10), // Ensure exercise_id is a number
        workout_id: parseInt(workoutExercise.workout_id, 10), // Ensure workout_id is a number
      };
      workoutExercises.push(newExercise);
      localStorage.setItem('workout_exercises', JSON.stringify(workoutExercises));
      console.log('Workout exercise added to localStorage:', newExercise);
      return newExercise;
    } else {
      const db = await CapacitorSQLite.open({ database: dbName });
      const result = await db.run({
        statement: "INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, notes) VALUES (?, ?, ?, ?, ?, ?);",
        values: [
          workoutExercise.workout_id,
          workoutExercise.exercise_id,
          workoutExercise.sets,
          workoutExercise.reps,
          workoutExercise.weight,
          workoutExercise.notes || '',
        ],
      });
      console.log('Workout exercise added to SQLite:', result);
      return result;
    }
  } catch (error) {
    console.error('Error adding workout exercise:', error);
    throw error;
  }
};

// Get exercises by workout_id
export const getExercisesByWorkoutId = async (workoutId, userId) => {
  try {
    if (isWebPlatform()) {
      const workoutExercises = JSON.parse(localStorage.getItem('workout_exercises') || '[]');
      const exercises = JSON.parse(localStorage.getItem(`exercises_${userId}`) || '[]');

      const result = workoutExercises
        .filter(we => parseInt(we.workout_id, 10) === parseInt(workoutId, 10))
        .map(we => {
          const exercise = exercises.find(e => parseInt(e.id, 10) === parseInt(we.exercise_id, 10));
          return exercise
            ? {
                ...exercise,
                ...we,
                workout_exercise_id: we.id 
              }
            : null;
        })
        .filter(e => e !== null);

      console.log('Found exercises for workout:', result);
      return result;
    } else {
      const db = await CapacitorSQLite.open({ database: dbName });
      const result = await db.query({
        statement: `
          SELECT e.*, we.id as workout_exercise_id, we.sets, we.reps, we.weight, we.notes, we.set_type
          FROM workout_exercises we
          JOIN exercises e ON we.exercise_id = e.id
          WHERE we.workout_id = ?;
        `,
        values: [workoutId],
      });

      return result.values || [];
    }
  } catch (error) {
    console.error('Error getting exercises by workout ID:', error);
    return [];
  }
};

// Remove a specific workout exercise entry by its unique ID
export const removeExerciseFromWorkout = async (workoutExerciseId) => {
  if (isWebPlatform()) {
    let workoutExercises = JSON.parse(localStorage.getItem('workout_exercises') || '[]');
    workoutExercises = workoutExercises.filter(we => we.id !== workoutExerciseId);
    localStorage.setItem('workout_exercises', JSON.stringify(workoutExercises));
    console.log(`Workout exercise ${workoutExerciseId} removed (localStorage)`);
  } else {
    const db = await CapacitorSQLite.open({ database: dbName });
    await db.run({
      statement: "DELETE FROM workout_exercises WHERE id = ?;",
      values: [workoutExerciseId],
    });
    console.log(`Workout exercise ${workoutExerciseId} removed (SQLite)`);
  }
};

// Start a new workout 
export const startNewWorkoutSession = async (workoutId) => {
  if (isWebPlatform()) {
    const newSession = {
      id: Date.now(),
      workoutId,
      startTime: new Date().toISOString(),
      completed: false
    };
    const sessions = JSON.parse(localStorage.getItem('workout_sessions') || '[]');
    sessions.push(newSession);
    localStorage.setItem('workout_sessions', JSON.stringify(sessions));
    return newSession;
  } else {
    const db = await CapacitorSQLite.open({ database: dbName });
    const result = await db.run({
      statement: `
        INSERT INTO workout_sessions (workout_id, start_time, completed)
        VALUES (?, ?, 0);
      `,
      values: [workoutId, new Date().toISOString()]
    });
    return { id: result.changes.lastId, workoutId };
  }
};

// Get current workout 
export const getCurrentWorkoutSession = async (workoutId) => {
  if (isWebPlatform()) {
    const sessions = JSON.parse(localStorage.getItem('workout_sessions') || '[]');
    return sessions.find(s => 
      s.workoutId === workoutId && !s.completed
    ) || null;
  } else {
    const db = await CapacitorSQLite.open({ database: dbName });
    const result = await db.query({
      statement: `
        SELECT * FROM workout_sessions
        WHERE workout_id = ? AND completed = 0
        ORDER BY start_time DESC
        LIMIT 1;
      `,
      values: [workoutId]
    });
    return result.values?.[0] || null;
  }
};

// Complete current workout
export const completeWorkoutSession = async (sessionId) => {
  if (isWebPlatform()) {
    const sessions = JSON.parse(localStorage.getItem('workout_sessions') || '[]');
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      session.completed = true;
      session.endTime = new Date().toISOString();
      localStorage.setItem('workout_sessions', JSON.stringify(sessions));
    }
  } else {
    const db = await CapacitorSQLite.open({ database: dbName });
    await db.run({
      statement: `
        UPDATE workout_sessions
        SET completed = 1, end_time = ?
        WHERE id = ?;
      `,
      values: [new Date().toISOString(), sessionId]
    });
  }
};

// Function to fetch all logs
export const getAllLogs = async (userId) => {
  if (isWebPlatform()) {
    const logs = JSON.parse(localStorage.getItem('logs') || '[]');
    const workouts = JSON.parse(localStorage.getItem(`workouts_${userId}`) || '[]');
    const exercises = JSON.parse(localStorage.getItem(`exercises_${userId}`) || '[]');

    return logs.filter(log => {
      const workout = workouts.find(w => parseInt(w.id, 10) === parseInt(log.workout_id, 10));
      return workout !== undefined; // Only include logs for user's workouts
    }).map(log => {
      const workoutId = parseInt(log.workout_id, 10);
      const exerciseId = parseInt(log.exercise_id, 10);
      
      const workout = workouts.find(w => parseInt(w.id, 10) === workoutId);
      const exercise = exercises.find(e => parseInt(e.id, 10) === exerciseId);

      return {
        ...log,
        workoutName: workout?.name || log.workoutName || 'Unknown Workout',
        exerciseName: exercise?.name || log.exerciseName || 'Unknown Exercise',
        primaryMuscleGroup: exercise?.primary_muscle_group || log.primaryMuscleGroup || 'N/A',
      };
    }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date descending
  } else {
    const db = await CapacitorSQLite.open({ database: 'fitpro.db' });

    const result = await db.query({
      statement: `
        SELECT 
          logs.*, 
          w.name AS workoutName, 
          e.name AS exerciseName, 
          e.primary_muscle_group AS primaryMuscleGroup
        FROM logs
        LEFT JOIN workouts w ON logs.workout_id = w.id
        LEFT JOIN exercises e ON logs.exercise_id = e.id
        WHERE w.userId = ?
        ORDER BY logs.date DESC;
      `,
      values: [userId]
    });

    return result.values || [];
  }
};

export const getLogsForWorkoutExercise = async (workoutId, exerciseId, sessionId = null) => {
  if (isWebPlatform()) {
    const logs = JSON.parse(localStorage.getItem('logs') || '[]');
    return logs.filter(log => 
      parseInt(log.workout_id, 10) === parseInt(workoutId, 10) && 
      parseInt(log.exercise_id, 10) === parseInt(exerciseId, 10) &&
      (sessionId ? parseInt(log.session_id, 10) === parseInt(sessionId, 10) : true)
    );
  } else {
    const db = await CapacitorSQLite.open({ database: dbName });
    const result = await db.query({
      statement: `
        SELECT * FROM logs
        WHERE workout_id = ? AND exercise_id = ?
        ${sessionId ? 'AND session_id = ?' : ''}
        ORDER BY date ASC;
      `,
      values: sessionId ? [workoutId, exerciseId, sessionId] : [workoutId, exerciseId]
    });
    return result.values || [];
  }
};

export const deleteLog = async (logId) => {
  if (isWebPlatform()) {
    const logs = JSON.parse(localStorage.getItem('logs') || '[]');
    const updatedLogs = logs.filter((log) => log.id !== logId);
    localStorage.setItem('logs', JSON.stringify(updatedLogs));
    console.log(`Log with ID ${logId} deleted from localStorage.`);
  } else {
    const db = await CapacitorSQLite.open({ database: 'fitpro.db' });
    await db.run({
      statement: "DELETE FROM logs WHERE id = ?;",
      values: [logId],
    });
    console.log(`Log with ID ${logId} deleted from SQLite.`);
  }
};


export const getExercisesForWorkout = async (workoutId, userId) => {
  if (isWebPlatform()) {
    console.log("Running on Web: Using localStorage");

    // Load data from localStorage with user-specific keys
    const workoutExercises = JSON.parse(localStorage.getItem('workout_exercises') || '[]');
    const exercises = JSON.parse(localStorage.getItem(`exercises_${userId}`) || '[]');

    console.log("Workout Exercises from storage:", workoutExercises);
    console.log("Exercises from storage:", exercises);

    // Convert IDs to numbers before filtering
    return workoutExercises
      .filter((we) => parseInt(we.workout_id, 10) === parseInt(workoutId, 10))
      .map((we) => {
        const exercise = exercises.find((e) => parseInt(e.id, 10) === parseInt(we.exercise_id, 10));
        if (!exercise) return null;
        return {
          ...exercise,
          ...we,
          exercise_id: parseInt(exercise.id, 10), // Ensure exercise_id is set correctly
          workout_exercise_id: we.id
        };
      })
      .filter((exercise) => exercise !== null); // Remove any null values
  } else {
    console.log("Running on Native: Using SQLite");

    // Use SQLite for native platforms
    const db = await CapacitorSQLite.open({ database: 'fitpro.db' });
    const result = await db.query({
      statement: `
        SELECT e.*, we.id as workout_exercise_id, we.sets, we.reps, we.weight, 
               e.id as exercise_id
        FROM workout_exercises we
        JOIN exercises e ON we.exercise_id = e.id
        WHERE we.workout_id = ?;
      `,
      values: [workoutId],
    });

    console.log("Workout Exercises from DB:", result.values);
    return result.values || [];
  }
};

// Function to log performance for an exercise
export const logPerformance = async (
  workoutId, 
  exerciseId, 
  sets, 
  reps, 
  weight,
  sessionId
) => {
  if (isWebPlatform()) {
    const logs = JSON.parse(localStorage.getItem('logs') || '[]');
    const workouts = JSON.parse(localStorage.getItem(`workouts_${getAuth().currentUser?.uid}`) || '[]');
    const exercises = JSON.parse(localStorage.getItem(`exercises_${getAuth().currentUser?.uid}`) || '[]');
    
    const workout = workouts.find(w => parseInt(w.id, 10) === parseInt(workoutId, 10));
    const exercise = exercises.find(e => parseInt(e.id, 10) === parseInt(exerciseId, 10));

    if (!exercise) {
      console.error('Exercise not found:', exerciseId);
      throw new Error(`Exercise with ID ${exerciseId} not found`);
    }

    const newLog = {
      id: Date.now(),
      workout_id: parseInt(workoutId, 10),
      exercise_id: parseInt(exerciseId, 10),
      session_id: parseInt(sessionId, 10),
      sets: parseInt(sets, 10),
      reps: parseInt(reps, 10),
      weight: parseFloat(weight) || 0,
      date: new Date().toISOString(),
      workoutName: workout?.name || 'Unknown Workout',
      exerciseName: exercise.name,
      primaryMuscleGroup: exercise.primary_muscle_group
    };

    console.log('Logging performance with exercise details:', newLog);
    logs.push(newLog);
    localStorage.setItem('logs', JSON.stringify(logs));
  } else {
    const db = await CapacitorSQLite.open({ database: dbName });
    await db.run({
      statement: `
        INSERT INTO logs (
          workout_id, 
          exercise_id, 
          session_id, 
          sets, 
          reps, 
          weight, 
          date,
          workout_name,
          exercise_name,
          primary_muscle_group
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, 
          (SELECT name FROM workouts WHERE id = ?),
          (SELECT name FROM exercises WHERE id = ?),
          (SELECT primary_muscle_group FROM exercises WHERE id = ?)
        );
      `,
      values: [
        workoutId, 
        exerciseId, 
        sessionId, 
        sets, 
        reps, 
        weight, 
        new Date().toISOString(),
        workoutId,
        exerciseId,
        exerciseId
      ]
    });
  }
};

// Function to add bimetric log
export const addBiometricLog = async (userId, height, weight) => {
  if (isWebPlatform()) {
    const logs = JSON.parse(localStorage.getItem('biometric_logs') || '[]');
    logs.push({ id: Date.now(), userId, date: new Date().toISOString(), height, weight });
    localStorage.setItem('biometric_logs', JSON.stringify(logs));
  } else {
    const db = await CapacitorSQLite.open({ database: dbName });
    await db.run({
      statement: 'INSERT INTO biometric_logs (userId, height, weight) VALUES (?, ?, ?);',
      values: [userId, height, weight],
    });
  }
};

// Function to fetch all biometric logs
export const getBiometricLogs = async (userId) => {
  if (isWebPlatform()) {
    const logs = JSON.parse(localStorage.getItem('biometric_logs') || '[]');
    return logs.filter(log => log.userId === userId);
  } else {
    const db = await CapacitorSQLite.open({ database: dbName });
    const result = await db.query({
      statement: 'SELECT * FROM biometric_logs WHERE userId = ? ORDER BY date ASC;',
      values: [userId],
    });
    return result.values || [];
  }
};

// Function to fetch workout stats
export const getWorkoutStats = async (userId) => {
  if (isWebPlatform()) {
    const logs = JSON.parse(localStorage.getItem('logs') || '[]');
    const workouts = JSON.parse(localStorage.getItem(`workouts_${userId}`) || '[]');
    const sessions = JSON.parse(localStorage.getItem('workout_sessions') || '[]');
    
    // Group logs by date and workout
    const workoutsByDate = logs.reduce((acc, log) => {
      const date = new Date(log.date).toISOString().split('T')[0];
      const workout = workouts.find(w => parseInt(w.id, 10) === parseInt(log.workout_id, 10));
      
      if (!workout) return acc;
      
      if (!acc[date]) {
        acc[date] = {
          uniqueWorkouts: new Set(),
          totalExercises: 0,
          sessions: new Set()
        };
      }
      
      acc[date].uniqueWorkouts.add(log.workout_id);
      acc[date].totalExercises += 1;
      if (log.session_id) {
        acc[date].sessions.add(log.session_id);
      }
      
      return acc;
    }, {});

    return Object.entries(workoutsByDate).map(([date, stats]) => {
      // Calculate total duration for all sessions on this date
      let totalDuration = 0;
      stats.sessions.forEach(sessionId => {
        const session = sessions.find(s => s.id === sessionId);
        if (session && session.startTime && session.endTime) {
          const duration = (new Date(session.endTime) - new Date(session.startTime)) / (1000 * 60); // Convert to minutes
          totalDuration += duration;
        }
      });

      return {
        date,
        count: stats.uniqueWorkouts.size,
        exercises: stats.totalExercises,
        duration: Math.round(totalDuration) // Round to nearest minute
      };
    });
  } else {
    const db = await CapacitorSQLite.open({ database: dbName });
    const result = await db.query({
      statement: `
        SELECT 
          date(l.date) as date,
          COUNT(DISTINCT l.workout_id) as count,
          COUNT(*) as exercises,
          SUM(
            CASE 
              WHEN ws.end_time IS NOT NULL 
              THEN ROUND((julianday(ws.end_time) - julianday(ws.start_time)) * 1440) 
              ELSE 0 
            END
          ) as duration
        FROM logs l
        JOIN workouts w ON l.workout_id = w.id
        LEFT JOIN workout_sessions ws ON l.session_id = ws.id
        WHERE w.userId = ?
        GROUP BY date(l.date)
        ORDER BY date ASC;
      `,
      values: [userId]
    });
    return result.values || [];
  }
};

// Function to fetch exercise stats
export const getExerciseStats = async (userId) => {
  if (isWebPlatform()) {
    const logs = JSON.parse(localStorage.getItem('logs') || '[]');
    const workouts = JSON.parse(localStorage.getItem(`workouts_${userId}`) || '[]');
    const exercises = JSON.parse(localStorage.getItem(`exercises_${userId}`) || '[]');

    // Filter logs to only include those from user's workouts
    const userLogs = logs.filter(log => {
      const workout = workouts.find(w => parseInt(w.id, 10) === parseInt(log.workout_id, 10));
      return workout !== undefined;
    });

    const grouped = userLogs.reduce((acc, log) => {
      const exercise = exercises.find(e => parseInt(e.id, 10) === parseInt(log.exercise_id, 10));
      const name = exercise?.name || 'Unknown';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, count]) => ({ name, count }));
  } else {
    const db = await CapacitorSQLite.open({ database: dbName });
    const result = await db.query({
      statement: `
        SELECT e.name as name, COUNT(*) as count
        FROM logs l
        LEFT JOIN exercises e ON l.exercise_id = e.id
        LEFT JOIN workouts w ON l.workout_id = w.id
        WHERE w.userId = ?
        GROUP BY e.name
        ORDER BY count DESC;
      `,
      values: [userId]
    });
    return result.values || [];
  }
};

// Function to add a workout log
export const addWorkoutLog = async (log) => {
  if (isWebPlatform()) {
    const logs = JSON.parse(localStorage.getItem('logs') || '[]');
    const newLog = {
      ...log,
      id: Date.now(),
      date: new Date().toISOString()
    };
    logs.push(newLog);
    localStorage.setItem('logs', JSON.stringify(logs));
  } else {
    const db = await CapacitorSQLite.open({ database: dbName });
    await db.run({
      statement: `
        INSERT INTO logs (userId, workoutName, date, exercises, notes)
        VALUES (?, ?, ?, ?, ?);
      `,
      values: [log.userId, log.workoutName, log.date, log.exercises, log.notes]
    });
  }
};
