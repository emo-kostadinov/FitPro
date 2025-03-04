import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonList, IonItem, IonLabel, IonInput } from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import { getWorkoutById, addWorkoutExercise, getAllExercises } from '../database/database';

const EditWorkout = () => {
  const { workoutId } = useParams();
  const history = useHistory();
  const [workout, setWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch workout directly from SQLite (No API)
        const workoutData = await getWorkoutById(workoutId);
        setWorkout(workoutData);

        // Fetch exercises directly from SQLite (No API)
        let exercisesData = await getAllExercises();

        if (!Array.isArray(exercisesData)) {
          console.error('Error: getAllExercises() did not return an array:', exercisesData);
          setExercises([]); 
        } else {
          console.log("Fetched Exercises:", exercisesData);
          setExercises(exercisesData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setExercises([]);
      }
    };

    fetchData();
  }, [workoutId]);

  const handleAddExercise = async () => {
    if (!selectedExercise || !sets || !reps || !weight) {
      alert('Please fill in all fields.');
      return;
    }

    const workoutExercise = {
      workout_id: workoutId,
      exercise_id: selectedExercise,
      sets: parseInt(sets, 10),
      reps: parseInt(reps, 10),
      weight: parseFloat(weight),
      notes: '',
    };

    try {
      await addWorkoutExercise(workoutExercise);
      alert('Exercise added to workout!');
      history.push(`/workouts/${workoutId}/exercises`);
    } catch (error) {
      console.error('Error adding exercise:', error);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Edit Workout: {workout?.name}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h2>Add Exercises to Workout</h2>

        {/* Exercise Selection */}
        <IonList>
          <IonItem>
            <IonLabel>Select Exercise</IonLabel>
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
            >
              <option value="">Choose an exercise</option>
              {exercises.length > 0 ? (
                exercises.map((exercise) => (
                  <option key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </option>
                ))
              ) : (
                <option disabled>No exercises found</option>
              )}
            </select>
          </IonItem>

          {/* Sets */}
          <IonItem>
            <IonLabel position="floating">Sets</IonLabel>
            <IonInput
              type="number"
              value={sets}
              onIonChange={(e) => setSets(e.detail.value)}
            />
          </IonItem>

          {/* Reps */}
          <IonItem>
            <IonLabel position="floating">Reps</IonLabel>
            <IonInput
              type="number"
              value={reps}
              onIonChange={(e) => setReps(e.detail.value)}
            />
          </IonItem>

          {/* Weight */}
          <IonItem>
            <IonLabel position="floating">Weight (kg)</IonLabel>
            <IonInput
              type="number"
              value={weight}
              onIonChange={(e) => setWeight(e.detail.value)}
            />
          </IonItem>
        </IonList>

        {/* Add Exercise Button */}
        <IonButton expand="block" onClick={handleAddExercise}>
          Add Exercise to Workout
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default EditWorkout;
