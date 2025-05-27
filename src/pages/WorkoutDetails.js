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
  IonText,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonChip,
  IonBadge,
  IonButtons,
  IonBackButton,
  IonGrid,
  IonRow,
  IonCol,
  IonSkeletonText
} from '@ionic/react';
import {
  timeOutline,
  barbellOutline,
  flameOutline,
  trendingUpOutline,
  playCircleOutline,
  createOutline,
  chevronForward,
  stopwatchOutline
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { getWorkoutById, getExercisesForWorkout } from '../database/database';
import { getAuth } from 'firebase/auth';

const WorkoutDetails = () => {
  const { workoutId } = useParams();
  const history = useHistory();
  const auth = getAuth();
  const [workout, setWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          console.error('No user logged in');
          history.push('/workouts');
          return;
        }

        const workoutData = await getWorkoutById(workoutId, userId);
        setWorkout(workoutData);

        const exercisesData = await getExercisesForWorkout(workoutId, userId);
        setExercises(exercisesData);
      } catch (error) {
        console.error('Error fetching workout details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [workoutId]);

  // Calculate workout statistics
  const totalExercises = exercises.length;
  const estimatedDuration = totalExercises * 5; // Rough estimate: 5 minutes per exercise
  const totalSets = exercises.reduce((acc, exercise) => acc + (exercise.sets || 0), 0);
  const estimatedCalories = totalSets * 8; // Rough estimate: 8 calories per set

  const renderLoadingState = () => (
    <>
      <div style={{ marginBottom: '20px' }}>
        <IonSkeletonText animated style={{ width: '60%', height: '32px' }} />
        <IonSkeletonText animated style={{ width: '40%', height: '20px' }} />
      </div>
      {[1, 2, 3].map((i) => (
        <IonCard key={i}>
          <IonCardContent>
            <IonSkeletonText animated style={{ width: '40%', height: '24px' }} />
            <IonSkeletonText animated style={{ width: '70%', height: '16px' }} />
          </IonCardContent>
        </IonCard>
      ))}
    </>
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/workouts" />
          </IonButtons>
          <IonTitle>{loading ? 'Loading...' : (workout?.name || 'Workout Details')}</IonTitle>
          {!loading && workout && (
            <IonButtons slot="end">
              <IonButton onClick={() => history.push(`/edit-workout/${workoutId}`)}>
                <IonIcon icon={createOutline} />
              </IonButton>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {loading ? (
          renderLoadingState()
        ) : workout ? (
          <>
            {/* Workout Summary Card */}
            <IonCard>
              <IonCardContent>
                <h1 style={{ 
                  margin: '0 0 16px',
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}>
                  {workout.name}
                </h1>
                
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ 
                    margin: '0',
                    opacity: '0.7',
                    fontSize: '16px'
                  }}>
                    {workout.description || 'No description provided'}
                  </p>
                </div>

                {/* Quick Stats Grid */}
                <IonGrid style={{ padding: 0 }}>
                  <IonRow>
                    <IonCol size="6" sizeMd="3">
                      <div style={{ textAlign: 'center' }}>
                        <IonIcon
                          icon={barbellOutline}
                          style={{
                            fontSize: '24px',
                            color: 'var(--ion-color-primary)',
                            marginBottom: '8px'
                          }}
                        />
                        <h3 style={{ margin: '0', fontSize: '20px', fontWeight: 'bold' }}>
                          {totalExercises}
                        </h3>
                        <p style={{ margin: '4px 0 0', opacity: '0.7', fontSize: '14px' }}>
                          Exercises
                        </p>
                      </div>
                    </IonCol>
                    <IonCol size="6" sizeMd="3">
                      <div style={{ textAlign: 'center' }}>
                        <IonIcon
                          icon={stopwatchOutline}
                          style={{
                            fontSize: '24px',
                            color: 'var(--ion-color-primary)',
                            marginBottom: '8px'
                          }}
                        />
                        <h3 style={{ margin: '0', fontSize: '20px', fontWeight: 'bold' }}>
                          {estimatedDuration}min
                        </h3>
                        <p style={{ margin: '4px 0 0', opacity: '0.7', fontSize: '14px' }}>
                          Duration
                        </p>
                      </div>
                    </IonCol>
                    <IonCol size="6" sizeMd="3">
                      <div style={{ textAlign: 'center' }}>
                        <IonIcon
                          icon={trendingUpOutline}
                          style={{
                            fontSize: '24px',
                            color: 'var(--ion-color-primary)',
                            marginBottom: '8px'
                          }}
                        />
                        <h3 style={{ margin: '0', fontSize: '20px', fontWeight: 'bold' }}>
                          {totalSets}
                        </h3>
                        <p style={{ margin: '4px 0 0', opacity: '0.7', fontSize: '14px' }}>
                          Total Sets
                        </p>
                      </div>
                    </IonCol>
                    <IonCol size="6" sizeMd="3">
                      <div style={{ textAlign: 'center' }}>
                        <IonIcon
                          icon={flameOutline}
                          style={{
                            fontSize: '24px',
                            color: 'var(--ion-color-primary)',
                            marginBottom: '8px'
                          }}
                        />
                        <h3 style={{ margin: '0', fontSize: '20px', fontWeight: 'bold' }}>
                          {estimatedCalories}
                        </h3>
                        <p style={{ margin: '4px 0 0', opacity: '0.7', fontSize: '14px' }}>
                          Est. Calories
                        </p>
                      </div>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonCardContent>
            </IonCard>

            {/* Start Workout Button */}
            <IonButton
              expand="block"
              style={{ margin: '20px 0' }}
              onClick={() => history.push(`/start-workout/${workoutId}`)}
            >
              <IonIcon icon={playCircleOutline} slot="start" />
              Start Workout
            </IonButton>

            {/* Exercises Section */}
            <div style={{ marginTop: '24px' }}>
              <h2 style={{ 
                fontSize: '20px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <IonIcon icon={barbellOutline} />
                Exercises
              </h2>

              {exercises.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {exercises.map((exercise, index) => (
                    <IonCard key={exercise.id} style={{ margin: 0 }}>
                      <IonCardContent>
                        <div style={{ 
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between'
                        }}>
                          <div>
                            <div style={{ 
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              marginBottom: '8px'
                            }}>
                              <h3 style={{ 
                                margin: 0,
                                fontSize: '18px',
                                fontWeight: '600'
                              }}>
                                {index + 1}. {exercise.name}
                              </h3>
                              {exercise.supersetWith && (
                                <IonChip color="warning" style={{ margin: 0 }}>
                                  <IonLabel>Superset</IonLabel>
                                </IonChip>
                              )}
                            </div>

                            <div style={{ 
                              display: 'flex',
                              gap: '16px',
                              marginTop: '12px'
                            }}>
                              <div>
                                <p style={{ 
                                  margin: 0,
                                  fontSize: '14px',
                                  opacity: '0.7'
                                }}>Sets</p>
                                <p style={{ 
                                  margin: '4px 0 0',
                                  fontSize: '16px',
                                  fontWeight: '500'
                                }}>{exercise.sets}</p>
                              </div>
                              <div>
                                <p style={{ 
                                  margin: 0,
                                  fontSize: '14px',
                                  opacity: '0.7'
                                }}>Reps</p>
                                <p style={{ 
                                  margin: '4px 0 0',
                                  fontSize: '16px',
                                  fontWeight: '500'
                                }}>{exercise.reps}</p>
                              </div>
                              <div>
                                <p style={{ 
                                  margin: 0,
                                  fontSize: '14px',
                                  opacity: '0.7'
                                }}>Weight</p>
                                <p style={{ 
                                  margin: '4px 0 0',
                                  fontSize: '16px',
                                  fontWeight: '500'
                                }}>{exercise.weight} kg</p>
                              </div>
                            </div>
                          </div>

                          <IonButton
                            fill="clear"
                            onClick={() => history.push(`/exercise/${exercise.id}`)}
                          >
                            <IonIcon icon={chevronForward} />
                          </IonButton>
                        </div>
                      </IonCardContent>
                    </IonCard>
                  ))}
                </div>
              ) : (
                <IonCard>
                  <IonCardContent className="ion-text-center">
                    <IonText color="medium">
                      <p style={{ margin: 0 }}>No exercises found for this workout.</p>
                    </IonText>
                    <IonButton
                      fill="clear"
                      onClick={() => history.push(`/edit-workout/${workoutId}`)}
                    >
                      Add Exercises
                    </IonButton>
                  </IonCardContent>
                </IonCard>
              )}
            </div>
          </>
        ) : (
          <IonCard>
            <IonCardContent className="ion-text-center">
              <IonText color="danger">
                <p style={{ margin: 0 }}>Unable to load workout details.</p>
              </IonText>
              <IonButton
                fill="clear"
                onClick={() => history.push('/workouts')}
              >
                Return to Workouts
              </IonButton>
            </IonCardContent>
          </IonCard>
        )}
      </IonContent>
    </IonPage>
  );
};

export default WorkoutDetails;
