import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonButtons,
  IonBackButton,
  IonText,
  IonChip,
  useIonToast,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonInput,
  IonAlert
} from '@ionic/react';
import {
  addOutline,
  barbellOutline,
  trashOutline,
  fitnessOutline,
  bodyOutline,
  diamondOutline,
  ribbonOutline,
  homeOutline,
  documentTextOutline
} from 'ionicons/icons';
import { getAuth } from 'firebase/auth';
import { 
  getAllExercises, 
  addExercise, 
  deleteExercise
} from '../database/database';
import { exerciseSchema } from '../validations/validationSchemas';

const muscleGroups = [
  'Upper chest', 'Chest', 'Lower chest', 'Back', 'Front delts', 'Side delts', 
  'Rear delts', 'Biceps', 'Triceps', 'Quadriceps', 'Hamstrings', 'Glutes', 
  'Calves', 'Tibialis', 'Abdominals', 'Forearms', 'Neck', 'Traps', 'Lats', 'Custom'
];

const Exercises = () => {
  const [exercises, setExercises] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newPrimaryMuscle, setNewPrimaryMuscle] = useState('');
  const [newSecondaryMuscle, setNewSecondaryMuscle] = useState('');
  const [customSecondaryMuscle, setCustomSecondaryMuscle] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState({});
  const [present] = useIonToast();

  const auth = getAuth();

  const loadExercises = async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = auth.currentUser?.uid;
      if (!userId) {
        setError('Please log in to view exercises');
        return;
      }
      
      const data = await getAllExercises(userId);
      const groupedExercises = data.reduce((acc, exercise) => {
        const group = exercise.primary_muscle_group || 'Other';
        if (!acc[group]) acc[group] = [];
        acc[group].push(exercise);
        return acc;
      }, {});
      setExercises(groupedExercises);
    } catch (error) {
      console.error('Error loading exercises:', error);
      setError('Failed to load exercises. Please try again.');
      present({
        message: 'Failed to load exercises',
        duration: 2000,
        position: 'bottom',
        color: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExercises();
  }, []);

  const handleAddExercise = async () => {
  setErrors({});
  const userId = auth.currentUser?.uid;

  if (!userId) {
    present({
      message: 'You must be logged in to add exercises',
      duration: 2000,
      position: 'bottom',
      color: 'danger'
    });
    return;
  }

  const exerciseName = newExerciseName.trim();
  const capitalizedName = exerciseName.charAt(0).toUpperCase() + exerciseName.slice(1);
  const finalSecondary = newSecondaryMuscle === 'Custom'
    ? customSecondaryMuscle.trim() || null
    : newSecondaryMuscle || null;

  const exercise = {
    name: capitalizedName,
    primary_muscle_group: newPrimaryMuscle,
    secondary_muscle_group: finalSecondary,
    notes: newNotes.trim(),
    userId
  };

  try {
    await exerciseSchema.validate(exercise, { abortEarly: false });
    await addExercise(userId, exercise);
    await loadExercises();

    // Reset form
    setNewExerciseName('');
    setNewPrimaryMuscle('');
    setNewSecondaryMuscle('');
    setCustomSecondaryMuscle('');
    setNewNotes('');
    setShowForm(false);

    present({
      message: 'Exercise added successfully!',
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const newErrors = {};
      error.inner.forEach(e => {
        newErrors[e.path] = e.message;
      });
      setErrors(newErrors);
    } else {
      console.error('Error adding exercise:', error);
      present({
        message: error.message || 'Failed to add exercise',
        duration: 2000,
        position: 'bottom',
        color: 'danger'
      });
    }
  }
};

  const handleDeleteExercise = async () => {
    if (exerciseToDelete !== null) {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        
        await deleteExercise(userId, exerciseToDelete);
        await loadExercises();
        
        present({
          message: 'Exercise deleted successfully!',
          duration: 2000,
          position: 'bottom',
          color: 'success'
        });
      } catch (error) {
        console.error('Error deleting exercise:', error);
        present({
          message: 'Failed to delete exercise',
          duration: 2000,
          position: 'bottom',
          color: 'danger'
        });
      }
      setExerciseToDelete(null);
    }
    setShowDeleteAlert(false);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/dashboard" />
          </IonButtons>
          <IonTitle>Exercises</IonTitle>
          <IonButtons slot="end">
            <IonButton routerLink="/dashboard">
              <IonIcon slot="icon-only" icon={homeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {!showForm ? (
          <IonButton 
            expand="block" 
            onClick={() => setShowForm(true)}
            className="ion-margin-bottom"
          >
            <IonIcon slot="start" icon={addOutline} />
            Add Exercise
          </IonButton>
        ) : (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle className="ion-text-center">Add New Exercise</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                <IonItem>
                  <IonLabel position="floating">Exercise Name *</IonLabel>
                  <IonInput 
                    value={newExerciseName} 
                    onIonChange={(e) => setNewExerciseName(e.detail.value)}
                    className={errors.name ? 'ion-invalid' : ''}
                  />
                </IonItem>
                {errors.name && (
                  <IonText color="danger" className="ion-padding-start">
                    <small>{errors.name}</small>
                  </IonText>
                )}

                <IonItem>
                  <IonLabel position="floating">Primary Muscle Group *</IonLabel>
                  <IonSelect 
                    value={newPrimaryMuscle} 
                    onIonChange={(e) => setNewPrimaryMuscle(e.detail.value)}
                    className={errors.primary_muscle_group ? 'ion-invalid' : ''}
                  >
                    {muscleGroups.map((muscle) => (
                      <IonSelectOption key={muscle} value={muscle}>{muscle}</IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
                {errors.primary_muscle_group && (
                  <IonText color="danger" className="ion-padding-start">
                    <small>{errors.primary_muscle_group}</small>
                  </IonText>
                )}

                <IonItem>
                  <IonLabel position="floating">Secondary Muscle Group</IonLabel>
                  <IonSelect 
                    value={newSecondaryMuscle} 
                    onIonChange={(e) => setNewSecondaryMuscle(e.detail.value)}
                  >
                    <IonSelectOption value="">None</IonSelectOption>
                    {muscleGroups.map((muscle) => (
                      <IonSelectOption key={muscle} value={muscle}>{muscle}</IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>

                {newSecondaryMuscle === 'Custom' && (
                  <IonItem>
                    <IonLabel position="floating">Custom Secondary Muscle</IonLabel>
                    <IonInput 
                      value={customSecondaryMuscle} 
                      onIonChange={(e) => setCustomSecondaryMuscle(e.detail.value)}
                    />
                  </IonItem>
                )}

                <IonItem>
                  <IonLabel position="floating">Notes</IonLabel>
                  <IonInput 
                    value={newNotes} 
                    onIonChange={(e) => setNewNotes(e.detail.value)}
                  />
                </IonItem>
              </IonList>

              <div className="ion-padding-top">
                <IonButton expand="block" onClick={handleAddExercise}>
                  <IonIcon slot="start" icon={addOutline} />
                  Save Exercise
                </IonButton>
                <IonButton 
                  color="medium" 
                  expand="block" 
                  onClick={() => setShowForm(false)}
                  className="ion-margin-top"
                >
                  Cancel
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        )}

        {loading ? (
          <div className="ion-text-center ion-padding">
            <IonText>Loading exercises...</IonText>
          </div>
        ) : error ? (
          <div className="ion-text-center ion-padding">
            <IonText color="danger">{error}</IonText>
            <IonButton 
              expand="block"
              onClick={loadExercises}
              className="ion-margin-top"
            >
              Try Again
            </IonButton>
          </div>
        ) : Object.keys(exercises).length === 0 ? (
          <div className="ion-text-center ion-padding">
            <IonIcon
              icon={barbellOutline}
              style={{
                fontSize: '48px',
                color: 'var(--ion-color-medium)',
                marginBottom: '16px'
              }}
            />
            <h2>No Exercises Yet</h2>
            <p>Add your first exercise to get started!</p>
          </div>
        ) : (
          Object.entries(exercises).map(([muscleGroup, exerciseList]) => (
            <IonCard key={muscleGroup} className="muscle-group-card">
              <IonItem color="light">
                <IonLabel>
                  <h2>{muscleGroup}</h2>
                  <p>{exerciseList.length} exercises</p>
                </IonLabel>
              </IonItem>
              <IonList>
                {exerciseList.map((exercise) => (
                  <div key={exercise.id} className="exercise-item-container">
                    <IonItem lines="none">
                      <IonLabel>
                        <h2>{exercise.name}</h2>
                        <div className="muscle-groups-container">
                          {exercise.primary_muscle_group && (
                            <IonChip outline>
                              <IonIcon icon={fitnessOutline} />
                              <IonLabel>{exercise.primary_muscle_group}</IonLabel>
                            </IonChip>
                          )}
                          {exercise.secondary_muscle_group && (
                            <IonChip outline>
                              <IonIcon icon={bodyOutline} />
                              <IonLabel>{exercise.secondary_muscle_group}</IonLabel>
                            </IonChip>
                          )}
                        </div>
                      </IonLabel>
                      <IonButton
                        fill="clear"
                        color="danger"
                        onClick={() => {
                          setExerciseToDelete(exercise.id);
                          setShowDeleteAlert(true);
                        }}
                        className="delete-button"
                      >
                        <IonIcon slot="icon-only" icon={trashOutline} />
                      </IonButton>
                    </IonItem>
                  </div>
                ))}
              </IonList>
            </IonCard>
          ))
        )}

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Delete Exercise"
          message="Are you sure you want to delete this exercise?"
          buttons={[
            { text: 'Cancel', role: 'cancel' },
            { text: 'Delete', handler: handleDeleteExercise }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Exercises;