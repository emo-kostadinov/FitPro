import React, { useState } from 'react';
import { IonCard, IonList, IonItem, IonLabel, IonInput, IonButton, IonDatetime } from '@ionic/react';
import { addWorkoutLog } from '../database/database';

const WorkoutLogger = ({ onLogAdded, onCancel }) => {
  const [workoutName, setWorkoutName] = useState('');
  const [date, setDate] = useState(new Date().toISOString());
  const [exercises, setExercises] = useState('');
  const [notes, setNotes] = useState('');

  const handleSaveLog = async () => {
    if (!workoutName || !exercises) {
      alert('Please enter a workout name and exercises performed.');
      return;
    }

    const log = {
      workoutName,
      date,
      exercises,
      notes,
    };

    await addWorkoutLog(log);
    if (onLogAdded) onLogAdded(); // Refresh logs in Logs.js

    setWorkoutName('');
    setDate(new Date().toISOString());
    setExercises('');
    setNotes('');
  };

  return (
    <IonCard>
      <IonList>
        <IonItem>
          <IonLabel position="floating">Workout Name *</IonLabel>
          <IonInput value={workoutName} onIonChange={(e) => setWorkoutName(e.detail.value)} />
        </IonItem>
        <IonItem>
          <IonLabel>Date</IonLabel>
          <IonDatetime value={date} onIonChange={(e) => setDate(e.detail.value)} />
        </IonItem>
        <IonItem>
          <IonLabel position="floating">Exercises Performed *</IonLabel>
          <IonInput value={exercises} onIonChange={(e) => setExercises(e.detail.value)} />
        </IonItem>
        <IonItem>
          <IonLabel position="floating">Notes</IonLabel>
          <IonInput value={notes} onIonChange={(e) => setNotes(e.detail.value)} />
        </IonItem>
      </IonList>
      <IonButton expand="block" onClick={handleSaveLog}>Save Log</IonButton>
      <IonButton color="medium" expand="block" onClick={onCancel}>Cancel</IonButton>
    </IonCard>
  );
};

export default WorkoutLogger;
