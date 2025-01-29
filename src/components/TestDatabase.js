import React, { useState } from 'react';
import { addExercise, getAllExercises } from '../database/services/exerciseService';

const TestDatabase = () => {
  const [exercises, setExercises] = useState([]);
  const [error, setError] = useState('');

  const handleAddExercise = async () => {
    try {
      const exercise = {
        name: 'Push-Up',
        region: 'Chest',
        primary_muscle: 'Pectorals',
        secondary_muscle: 'Triceps',
        notes: 'Bodyweight exercise',
      };
      await addExercise(exercise);
      alert('Exercise added!');
      setError('');
    } catch (error) {
      setError('Error adding exercise: ' + error.message);
    }
  };

  const handleGetExercises = async () => {
    try {
      const result = await getAllExercises();
      setExercises(result);
      setError('');
    } catch (error) {
      setError('Error fetching exercises: ' + error.message);
    }
  };

  return (
    <div>
      <button onClick={handleAddExercise}>Add Exercise</button>
      <button onClick={handleGetExercises}>Get Exercises</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {exercises.map((exercise) => (
          <li key={exercise.id}>
            {exercise.name} - {exercise.region}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TestDatabase;
