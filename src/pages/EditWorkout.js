import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonText,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonChip
} from '@ionic/react';
import {
  barbellOutline,
  trashOutline,
  addOutline,
  closeOutline,
  homeOutline,
  fitnessOutline,
  documentTextOutline
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import {
  getWorkoutById,
  getAllExercises,
  addWorkoutExercise,
  getExercisesByWorkoutId,
  removeExerciseFromWorkout,
} from '../database/database';
import { logSchema } from '../validations/validationSchemas';
import { getAuth } from 'firebase/auth';

const EditWorkout = () => {
  const { workoutId } = useParams();
  const history = useHistory();
  const auth = getAuth();
  const [workout, setWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [existingExercises, setExistingExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const loadWorkoutDetails = async () => {
    try {
      setLoading(true);
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.error('No user logged in');
        history.push('/workouts');
        return;
      }

      const workoutData = await getWorkoutById(workoutId, userId);
      if (!workoutData) {
        console.error('Workout not found');
        history.push('/workouts');
        return;
      }
      setWorkout(workoutData);

      // Load exercises for this workout
      const workoutExercises = await getExercisesByWorkoutId(workoutId, userId);
      setExercises(workoutExercises);

      // Load all available exercises
      const allExercises = await getAllExercises(userId);
      setExistingExercises(allExercises);
    } catch (error) {
      console.error('Error loading workout details:', error);
      setError('Failed to load workout details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkoutDetails();
  }, [workoutId]);

  const handleAddExercise = async () => {
    setError('');
    
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        setError('Please log in to add exercises');
        return;
      }

      if (!selectedExercise || !sets || !reps) {
        setError('Please fill in all required fields');
        return;
      }

      if (parseInt(sets) <= 0 || parseInt(reps) <= 0 || (weight && parseFloat(weight) < 0)) {
        setError('Sets and reps must be positive. Weight cannot be negative.');
        return;
      }

      const workoutExercise = {
        workout_id: Number(workoutId),
        exercise_id: Number(selectedExercise),
        sets: parseInt(sets, 10),
        reps: parseInt(reps, 10),
        weight: weight ? parseFloat(weight) : null,
        notes: '',
      };

      await addWorkoutExercise(workoutExercise);
      await loadWorkoutDetails(); // This will refresh the exercises list

      // Reset form
      setSelectedExercise('');
      setSets('');
      setReps('');
      setWeight('');
      setShowForm(false); // Hide form after successful addition
      setError(''); // Clear any errors
    } catch (err) {
      console.error('Error adding exercise:', err);
      setError('Failed to add exercise. Please try again.');
    }
  };

  const handleRemove = async (workoutExerciseId) => {
    try {
      await removeExerciseFromWorkout(workoutExerciseId);
      await loadWorkoutDetails();
    } catch (error) {
      console.error('Error removing exercise:', error);
      setError('Failed to remove exercise');
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Loading...</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <p>Loading workout details...</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/workouts" />
          </IonButtons>
          <IonTitle>Edit: {workout?.name}</IonTitle>
          <IonButtons slot="end">
            <IonButton routerLink="/dashboard">
              <IonIcon slot="icon-only" icon={homeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Add Exercise Button */}
        <IonButton
          expand="block"
          onClick={() => setShowForm(!showForm)}
          className="ion-margin-bottom"
        >
          <IonIcon slot="start" icon={showForm ? closeOutline : addOutline} />
          {showForm ? 'Cancel' : 'Add Exercise'}
        </IonButton>

        {/* Add Exercise Form */}
        {showForm && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Add Exercise to Workout</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {error && (
                <IonText color="danger" style={{ display: 'block', marginBottom: '16px' }}>
                  <p style={{ margin: 0 }}>{error}</p>
                </IonText>
              )}

              <IonList>
                <IonItem>
                  <IonLabel position="stacked">Select Exercise*</IonLabel>
                  <IonSelect
                    value={selectedExercise}
                    placeholder="Choose an exercise"
                    onIonChange={e => setSelectedExercise(e.detail.value)}
                  >
                    {existingExercises.map(ex => (
                      <IonSelectOption key={ex.id} value={ex.id}>
                        {ex.name} ({ex.primary_muscle_group})
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Sets*</IonLabel>
                  <IonInput
                    type="number"
                    value={sets}
                    onIonChange={e => setSets(e.detail.value)}
                    min="1"
                    placeholder="Enter number of sets"
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Reps*</IonLabel>
                  <IonInput
                    type="number"
                    value={reps}
                    onIonChange={e => setReps(e.detail.value)}
                    min="1"
                    placeholder="Enter number of reps"
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Weight (kg)</IonLabel>
                  <IonInput
                    type="number"
                    value={weight}
                    onIonChange={e => setWeight(e.detail.value)}
                    min="0"
                    step="0.1"
                    placeholder="Enter weight (optional)"
                  />
                </IonItem>
              </IonList>

              <IonButton
                expand="block"
                onClick={handleAddExercise}
                style={{ marginTop: '16px' }}
              >
                Add Exercise to Workout
              </IonButton>
            </IonCardContent>
          </IonCard>
        )}

        {/* Current Exercises List */}
        <IonCard style={{ marginTop: '20px' }}>
          <IonCardHeader>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <IonCardTitle>Current Exercises</IonCardTitle>
              <IonChip color="primary">
                <IonIcon icon={barbellOutline} />
                <IonLabel>{exercises.length} Exercises</IonLabel>
              </IonChip>
            </div>
          </IonCardHeader>
          <IonCardContent>
            {exercises.length > 0 ? (
              exercises.map((ex, index) => (
                <IonItemSliding key={ex.workout_exercise_id || ex.id}>
                  <IonItem>
                    <IonLabel>
                      <h2>{index + 1}. {ex.name}</h2>
                      <p>
                        Sets: {ex.sets} | Reps: {ex.reps}
                        {ex.weight ? ` | Weight: ${ex.weight}kg` : ''}
                      </p>
                    </IonLabel>
                  </IonItem>
                  <IonItemOptions side="end">
                    <IonItemOption 
                      color="danger"
                      onClick={() => handleRemove(ex.workout_exercise_id || ex.id)}
                    >
                      <IonIcon slot="icon-only" icon={trashOutline} />
                    </IonItemOption>
                  </IonItemOptions>
                </IonItemSliding>
              ))
            ) : (
              <p className="ion-text-center">No exercises added yet</p>
            )}
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default EditWorkout;
