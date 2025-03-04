import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel } from '@ionic/react';
import { useParams } from 'react-router-dom';
import { getWorkoutById, getExercisesForWorkout } from '../database/database';

const WorkoutDetails = () => {
  const { workoutId } = useParams();
  const [workout, setWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const workoutData = await getWorkoutById(workoutId);
        setWorkout(workoutData);

        const exercisesData = await getExercisesForWorkout(workoutId);
        setExercises(exercisesData);
      } catch (error) {
        console.error('Error fetching workout details:', error);
      }
    };
    fetchData();
  }, [workoutId]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Workout Details</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h2>{workout?.name}</h2>
        <h3>Exercises:</h3>
        <IonList>
          {exercises.map((exercise) => (
            <IonItem key={exercise.id}>
              <IonLabel>
                <h2>{exercise.name}</h2>
                <p>Sets: {exercise.sets}</p>
                <p>Reps: {exercise.reps}</p>
                <p>Weight: {exercise.weight} kg</p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default WorkoutDetails;
