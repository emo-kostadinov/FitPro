import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonInput, IonAlert, IonCard } from '@ionic/react';
import { addExercise, getAllExercises, deleteExercise } from '../database/database';

const Exercises = () => {
  const [exercises, setExercises] = useState({});
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newPrimaryMuscle, setNewPrimaryMuscle] = useState('');
  const [newSecondaryMuscle, setNewSecondaryMuscle] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Fetch and group exercises by primary muscle group
  useEffect(() => {
    const fetchExercises = async () => {
      const data = await getAllExercises();

      // Group exercises by primary_muscle_group, default to 'Other'
      const groupedExercises = data.reduce((acc, exercise) => {
        const group = exercise.primary_muscle_group || 'Other';
        if (!acc[group]) acc[group] = [];
        acc[group].push(exercise);
        return acc;
      }, {});

      setExercises(groupedExercises);
    };
    fetchExercises();
  }, []);

  const handleAddExercise = async () => {
    if (!newExerciseName.trim() || !newPrimaryMuscle.trim()) {
      alert('Please fill in the required fields!');
      return;
    }

    const exercise = {
      name: newExerciseName.trim(),
      primary_muscle_group: newPrimaryMuscle.trim(),
      secondary_muscle_group: newSecondaryMuscle.trim(),
      notes: newNotes.trim(),
    };

    await addExercise(exercise);
    // Refresh list after adding
    const data = await getAllExercises();
    const groupedExercises = data.reduce((acc, exercise) => {
      const group = exercise.primary_muscle_group || 'Other';
      if (!acc[group]) acc[group] = [];
      acc[group].push(exercise);
      return acc;
    }, {});
    setExercises(groupedExercises);

    setNewExerciseName('');
    setNewPrimaryMuscle('');
    setNewSecondaryMuscle('');
    setNewNotes('');
    setShowForm(false);
  };

  const handleDeleteExercise = async () => {
    if (exerciseToDelete !== null) {
      await deleteExercise(exerciseToDelete);
      // Refresh list after deletion
      const data = await getAllExercises();
      const groupedExercises = data.reduce((acc, exercise) => {
        const group = exercise.primary_muscle_group || 'Other';
        if (!acc[group]) acc[group] = [];
        acc[group].push(exercise);
        return acc;
      }, {});
      setExercises(groupedExercises);
      setExerciseToDelete(null);
    }
    setShowDeleteAlert(false);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Exercises</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h2>Manage Exercises</h2>

        {!showForm && (
          <IonButton expand="block" onClick={() => setShowForm(true)}>
            Add Exercise
          </IonButton>
        )}

        {showForm && (
          <IonCard>
            <IonList>
              <IonItem>
                <IonLabel position="floating">Exercise Name *</IonLabel>
                <IonInput value={newExerciseName} onIonChange={(e) => setNewExerciseName(e.detail.value)} />
              </IonItem>
              <IonItem>
                <IonLabel position="floating">Primary Muscle Group *</IonLabel>
                <IonInput value={newPrimaryMuscle} onIonChange={(e) => setNewPrimaryMuscle(e.detail.value)} />
              </IonItem>
              <IonItem>
                <IonLabel position="floating">Secondary Muscle Group</IonLabel>
                <IonInput value={newSecondaryMuscle} onIonChange={(e) => setNewSecondaryMuscle(e.detail.value)} />
              </IonItem>
              <IonItem>
                <IonLabel position="floating">Notes</IonLabel>
                <IonInput value={newNotes} onIonChange={(e) => setNewNotes(e.detail.value)} />
              </IonItem>
            </IonList>
            <IonButton expand="block" onClick={handleAddExercise}>Save Exercise</IonButton>
            <IonButton color="medium" expand="block" onClick={() => setShowForm(false)}>Cancel</IonButton>
          </IonCard>
        )}

        <IonList>
          {exercises && Object.keys(exercises).length > 0 ? (
            Object.entries(exercises).map(([muscleGroup, groupExercises]) => (
              <React.Fragment key={muscleGroup}>
                <IonList>
                  <IonLabel>
                    <h2>{muscleGroup}</h2>
                  </IonLabel>
                </IonList>
                {Array.isArray(groupExercises) && groupExercises.length > 0 ? (
                  groupExercises.map((exercise) => (
                    <IonItem key={exercise.id}>
                      <IonLabel>
                        <h3>{exercise.name}</h3>
                        <p>Primary: {exercise.primary_muscle_group || 'N/A'}</p>
                        <p>Secondary: {exercise.secondary_muscle_group || 'N/A'}</p>
                        <p>Notes: {exercise.notes || '-'}</p>
                      </IonLabel>
                      <IonButton
                        color="danger"
                        onClick={() => {
                          setExerciseToDelete(exercise.id);
                          setShowDeleteAlert(true);
                        }}
                        shape="round"
                      >
                        Delete
                      </IonButton>
                    </IonItem>
                  ))
                ) : (
                  <IonItem>
                    <IonLabel>No exercises available in this group</IonLabel>
                  </IonItem>
                )}
              </React.Fragment>
            ))
          ) : (
            <IonItem>
              <IonLabel>No exercises available</IonLabel>
            </IonItem>
          )}
        </IonList>

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Delete Exercise"
          message="Are you sure you want to delete this exercise?"
          buttons={[
            { text: 'Cancel', role: 'cancel' },
            { text: 'Delete', handler: handleDeleteExercise },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Exercises;
