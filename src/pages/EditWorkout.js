import React, { useState, useEffect } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
  IonList, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonText
} from '@ionic/react';
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
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const workoutData = await getWorkoutById(workoutId);
        setWorkout(workoutData);

        const exercisesData = await getAllExercises();
        if (Array.isArray(exercisesData)) {
          setExercises(exercisesData);
        } else {
          console.error('getAllExercises() did not return array:', exercisesData);
          setExercises([]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setExercises([]);
      }
    };
    fetchData();
  }, [workoutId]);

  const handleAddExercise = async () => {
    setError('');
    if (!selectedExercise || !sets || !reps || !weight) {
      setError('Please fill in all fields.');
      return;
    }
    if (parseInt(sets) <= 0 || parseInt(reps) <= 0 || parseFloat(weight) < 0) {
      setError('Sets and reps must be positive. Weight cannot be negative.');
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
      // Reset form
      setSelectedExercise('');
      setSets('');
      setReps('');
      setWeight('');
      history.push(`/workouts/${workoutId}/exercises`);
    } catch (err) {
      console.error('Error adding exercise:', err);
      setError('Failed to add exercise.');
    }
  };

  if (!workout) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Edit Workout</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <p>Loading workout...</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Edit Workout: {workout.name}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h2>Add Exercises to Workout</h2>

        {error && <IonText color="danger">{error}</IonText>}

        <IonList>
          <IonItem>
            <IonLabel>Select Exercise</IonLabel>
            <IonSelect
              value={selectedExercise}
              placeholder="Choose an exercise"
              onIonChange={e => setSelectedExercise(e.detail.value)}
            >
              {exercises.length > 0 ? exercises.map(exercise => (
                <IonSelectOption key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </IonSelectOption>
              )) : (
                <IonSelectOption disabled>No exercises found</IonSelectOption>
              )}
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonLabel position="floating">Sets</IonLabel>
            <IonInput
              type="number"
              value={sets}
              onIonChange={e => setSets(e.detail.value)}
              min={1}
            />
          </IonItem>

          <IonItem>
            <IonLabel position="floating">Reps</IonLabel>
            <IonInput
              type="number"
              value={reps}
              onIonChange={e => setReps(e.detail.value)}
              min={1}
            />
          </IonItem>

          <IonItem>
            <IonLabel position="floating">Weight (kg)</IonLabel>
            <IonInput
              type="number"
              value={weight}
              onIonChange={e => setWeight(e.detail.value)}
              min={0}
              step="0.1"
            />
          </IonItem>
        </IonList>

        <IonButton expand="block" onClick={handleAddExercise}>
          Add Exercise to Workout
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default EditWorkout;
