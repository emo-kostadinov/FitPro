import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/react';
import { addWorkout, getAllWorkouts, deleteWorkout } from '../database/database';

const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [newWorkoutName, setNewWorkoutName] = useState('');

  const fetchWorkouts = async () => {
    try {
      const result = await getAllWorkouts();
      setWorkouts(result);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    }
  };

  const handleAddWorkout = async () => {
    if (!newWorkoutName.trim()) {
      alert('Please enter a workout name!');
      return;
    }

    try {
      await addWorkout({ name: newWorkoutName, archived: 0 });
      setNewWorkoutName('');
      fetchWorkouts();
    } catch (error) {
      console.error('Error adding workout:', error);
    }
  };

  const handleDeleteWorkout = async (id) => {
    try {
      await deleteWorkout(id);
      fetchWorkouts();
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Workouts</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonInput
          value={newWorkoutName}
          placeholder="Enter workout name"
          onIonChange={(e) => setNewWorkoutName(e.target.value)}
        />
        <IonButton expand="block" onClick={handleAddWorkout}>
          Add Workout
        </IonButton>
        <IonList>
          {workouts.length > 0 ? (
            workouts.map((workout) => (
              <IonItem key={workout.id}>
                <IonLabel>{workout.name}</IonLabel>
                <IonButton color="danger" onClick={() => handleDeleteWorkout(workout.id)}>
                  Delete
                </IonButton>
              </IonItem>
            ))
          ) : (
            <IonItem>
              <IonLabel>No workouts available</IonLabel>
            </IonItem>
          )}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Workouts;
