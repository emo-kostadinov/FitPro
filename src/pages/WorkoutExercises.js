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
  IonInput,
  IonButton,
  IonCard,
  IonText,
  IonIcon,
  IonButtons,
  IonBackButton,
  IonFooter
} from '@ionic/react';
import {
  barbellOutline,
  fitnessOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  homeOutline,
  listOutline
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import {
  getExercisesForWorkout,
  logPerformance,
  getLogsForWorkoutExercise,
  startNewWorkoutSession,
  completeWorkoutSession
} from '../database/database';
import { getAuth } from 'firebase/auth';
import WorkoutProgressChart from '../components/WorkoutProgressChart';
import { singleSetLogSchema } from '../validations/validationSchemas';

const WorkoutExercises = () => {
  const { workoutId } = useParams();
  const history = useHistory();
  const auth = getAuth();

  const [exercises, setExercises] = useState([]);
  const [currentLogs, setCurrentLogs] = useState({});
  const [completedSets, setCompletedSets] = useState({});
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});
  const [workoutSummary, setWorkoutSummary] = useState(null);
  const [isLogging, setIsLogging] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const initializeWorkout = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.error('No user logged in');
        history.push('/workouts');
        return;
      }

      const newSession = await startNewWorkoutSession(workoutId);
      setSessionId(newSession.id);

      const fetchedExercises = await getExercisesForWorkout(workoutId, userId);
      setExercises(fetchedExercises);

      const initialLogs = {};
      const initialCompletedSets = {};
      
      fetchedExercises.forEach(ex => {
        initialLogs[ex.exercise_id] = { reps: '', weight: '' };
        initialCompletedSets[ex.exercise_id] = 0;
      });

      setCurrentLogs(initialLogs);
      setCompletedSets(initialCompletedSets);
      setCurrentExerciseIndex(0);
      setValidationErrors({});
    } catch (error) {
      console.error("Error initializing workout:", error);
    }
  };

  useEffect(() => {
    initializeWorkout();
  }, [workoutId]);

  const handleLogSet = async (exerciseId) => {
    setIsLogging(true);
    setValidationErrors({});

    try {
      const exercise = exercises.find(ex => ex.exercise_id === exerciseId);
      if (!exercise) throw new Error("Exercise not found");

      const currentExerciseLog = currentLogs[exerciseId] || {};
      const reps = currentExerciseLog.reps;
      const weight = currentExerciseLog.weight || 0;

      await singleSetLogSchema.validate({ reps, weight }, { abortEarly: false });

      const setsCompleted = completedSets[exerciseId] || 0;
      if (setsCompleted >= exercise.sets) {
        throw new Error(`All ${exercise.sets} sets already completed`);
      }

      await logPerformance(
        workoutId,
        exerciseId,
        1,
        reps,
        weight,
        sessionId
      );

      setCompletedSets(prev => ({
        ...prev,
        [exerciseId]: (prev[exerciseId] || 0) + 1
      }));

      setCurrentLogs(prev => ({
        ...prev,
        [exerciseId]: {
          reps: '',
          weight: weight
        }
      }));

    } catch (error) {
      console.error("Error logging set:", error);
      if (error.name === 'ValidationError') {
        const errors = {};
        error.inner.forEach(err => {
          errors[err.path] = err.message;
        });
        setValidationErrors(errors);
      } else {
        setValidationErrors({ general: error.message });
      }
    } finally {
      setIsLogging(false);
    }
  };

  const calculateWorkoutSummary = async () => {
    let totalSets = 0;
    let totalReps = 0;
    let totalWeight = 0;
    const musclesTargeted = new Set();

    for (const exercise of exercises) {
      const logs = await getLogsForWorkoutExercise(workoutId, exercise.exercise_id, sessionId);
      
      const exerciseSets = logs.reduce((sum, log) => sum + (parseInt(log.sets) || 0), 0);
      const exerciseReps = logs.reduce((sum, log) => sum + (parseInt(log.reps) || 0), 0);
      const exerciseWeight = logs.reduce((sum, log) => sum + ((parseFloat(log.weight) || 0) * (parseInt(log.sets) || 0)), 0);

      totalSets += exerciseSets;
      totalReps += exerciseReps;
      totalWeight += exerciseWeight;

      if (exercise.primary_muscle_group) musclesTargeted.add(exercise.primary_muscle_group);
      if (exercise.secondary_muscle_group) musclesTargeted.add(exercise.secondary_muscle_group);
    }

    return {
      totalSets,
      totalReps,
      totalWeight: totalWeight.toFixed(2),
      musclesTargeted: Array.from(musclesTargeted).join(', ') || 'None'
    };
  };

  const handleNextExercise = async () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      const summary = await calculateWorkoutSummary();
      setWorkoutSummary(summary);
    }
  };

  const finishWorkout = async () => {
    await completeWorkoutSession(sessionId);
    history.push('/workouts');
  };

  if (!exercises.length) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/workouts" />
            </IonButtons>
            <IonTitle>Workout</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className="empty-workout-state">
            <IonIcon icon={alertCircleOutline} />
            <h2>No Exercises Found</h2>
            <p>This workout doesn't have any exercises yet.</p>
            <IonButton routerLink="/workouts" className="ion-margin-top">
              Back to Workouts
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (workoutSummary) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Workout Summary</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className="workout-summary-card">
            <div className="workout-summary-header">
              <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: '48px', color: 'var(--ion-color-success)' }} />
              <h2>Workout Completed!</h2>
            </div>

            <div className="workout-stats-grid">
              <div className="workout-stat-item">
                <div className="workout-stat-label">Total Sets</div>
                <div className="workout-stat-value">{workoutSummary.totalSets}</div>
              </div>
              <div className="workout-stat-item">
                <div className="workout-stat-label">Total Reps</div>
                <div className="workout-stat-value">{workoutSummary.totalReps}</div>
              </div>
              <div className="workout-stat-item">
                <div className="workout-stat-label">Weight Lifted</div>
                <div className="workout-stat-value">{workoutSummary.totalWeight} kg</div>
              </div>
            </div>

            <div className="workout-muscles-targeted">
              <h3>Muscles Targeted</h3>
              <p>{workoutSummary.musclesTargeted}</p>
            </div>

            <div className="ion-padding">
              <IonButton expand="block" onClick={finishWorkout}>
                Complete Workout
              </IonButton>
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const currentExercise = exercises[currentExerciseIndex];
  const completed = completedSets[currentExercise.exercise_id] || 0;
  const currentSetDisplay = Math.min(completed + 1, currentExercise.sets);
  const canLogMoreSets = completed < currentExercise.sets;
  const progress = (completed / currentExercise.sets) * 100;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/workouts" />
          </IonButtons>
          <IonTitle>{currentExercise.name}</IonTitle>
          <IonButtons slot="end">
            <IonButton routerLink="/dashboard">
              <IonIcon slot="icon-only" icon={homeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="workout-exercise-card">
          <div className="workout-exercise-header">
            <h2>
              <IonIcon icon={barbellOutline} style={{ marginRight: '8px' }} />
              {currentExercise.name}
            </h2>
            <div className="workout-set-counter">
              Set {currentSetDisplay} of {currentExercise.sets}
            </div>
            {!canLogMoreSets && (
              <div className="ion-margin-top">
                <IonText color="success">
                  <IonIcon icon={checkmarkCircleOutline} /> All sets completed!
                </IonText>
              </div>
            )}
            {validationErrors.general && (
              <div className="ion-margin-top">
                <IonText color="danger">
                  <IonIcon icon={alertCircleOutline} /> {validationErrors.general}
                </IonText>
              </div>
            )}
          </div>

          <div className="workout-exercise-form">
            <IonList>
              <IonItem>
                <IonLabel position="floating">Reps *</IonLabel>
                <IonInput
                  type="number"
                  value={currentLogs[currentExercise.exercise_id]?.reps || ''}
                  onIonChange={e => setCurrentLogs(prev => ({
                    ...prev,
                    [currentExercise.exercise_id]: {
                      ...prev[currentExercise.exercise_id],
                      reps: e.detail.value
                    }
                  }))}
                  disabled={!canLogMoreSets}
                  min="1"
                />
                {validationErrors.reps && (
                  <IonText color="danger" className="ion-padding-top">
                    <small>{validationErrors.reps}</small>
                  </IonText>
                )}
              </IonItem>

              <IonItem>
                <IonLabel position="floating">Weight (kg)</IonLabel>
                <IonInput
                  type="number"
                  value={currentLogs[currentExercise.exercise_id]?.weight || ''}
                  onIonChange={e => setCurrentLogs(prev => ({
                    ...prev,
                    [currentExercise.exercise_id]: {
                      ...prev[currentExercise.exercise_id],
                      weight: e.detail.value
                    }
                  }))}
                  disabled={!canLogMoreSets}
                  min="0"
                  step="0.1"
                />
                {validationErrors.weight && (
                  <IonText color="danger" className="ion-padding-top">
                    <small>{validationErrors.weight}</small>
                  </IonText>
                )}
              </IonItem>
            </IonList>
          </div>

          <div className="workout-exercise-actions">
            <IonButton 
              expand="block" 
              onClick={() => handleLogSet(currentExercise.exercise_id)}
              disabled={!canLogMoreSets || isLogging}
            >
              <IonIcon icon={fitnessOutline} slot="start" />
              {isLogging ? 'Logging...' : `Log Set ${currentSetDisplay}`}
            </IonButton>

            <WorkoutProgressChart 
              workoutId={workoutId} 
              workoutExerciseId={currentExercise.exercise_id}
            />

            <IonButton 
              expand="block" 
              onClick={handleNextExercise}
              fill="outline"
              className="ion-margin-top"
            >
              {currentExerciseIndex < exercises.length - 1 ? 'Next Exercise' : 'Finish Workout'}
            </IonButton>
          </div>
        </div>
      </IonContent>

      <IonFooter>
        <IonToolbar>
          <IonButtons style={{ display: 'flex', justifyContent: 'space-around' }}>
            <IonButton routerLink="/dashboard">
              <IonIcon slot="start" icon={homeOutline} />
              Dashboard
            </IonButton>
            <IonButton routerLink="/workouts">
              <IonIcon slot="start" icon={barbellOutline} />
              Workouts
            </IonButton>
            <IonButton routerLink="/logs">
              <IonIcon slot="start" icon={listOutline} />
              Logs
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default WorkoutExercises;