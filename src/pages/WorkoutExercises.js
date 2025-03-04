import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonInput, IonButton, IonCard } from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import { getExercisesForWorkout, logPerformance, getLogsForWorkoutExercise } from '../database/database';
import WorkoutProgressChart from '../components/WorkoutProgressChart';  // Correct relative path

const WorkoutExercises = () => {
  const { workoutId } = useParams();
  const history = useHistory();
  const [exercises, setExercises] = useState([]);
  const [logs, setLogs] = useState({}); // Stores logs for each exercise
  const [previousLogs, setPreviousLogs] = useState({}); // Stores previous logs
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  // Fetch exercises and logs on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch exercises for the workout
        const fetchedExercises = await getExercisesForWorkout(workoutId);
        setExercises(fetchedExercises);

        // Fetch logs for each exercise
        let logsData = {};
        for (const exercise of fetchedExercises) {
          const logs = await getLogsForWorkoutExercise(workoutId, exercise.id);
          logsData[exercise.id] = logs.length > 0 ? logs[logs.length - 1] : { sets: 0, reps: 0, weight: 0 };
        }
        setPreviousLogs(logsData);

        console.log("Previous logs loaded:", logsData); // Debugging output
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
    };

    fetchData();
  }, [workoutId]);

  // Handle logging performance
  const handleLogPerformance = async (exerciseId) => {
    const log = logs[exerciseId];
    if (!log || !log.sets || !log.reps || !log.weight) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      await logPerformance(workoutId, exerciseId, log.sets, log.reps, log.weight);
      alert('Performance logged successfully!');

      // Fetch updated logs
      const updatedLogs = await getLogsForWorkoutExercise(workoutId, exerciseId);
      setPreviousLogs({
        ...previousLogs,
        [exerciseId]: updatedLogs.length > 0 ? updatedLogs[updatedLogs.length - 1] : { sets: 0, reps: 0, weight: 0 },
      });

      // Auto-advance to next exercise
      if (currentExerciseIndex < exercises.length - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1);
      } else {
        alert('Workout Completed!');
        history.push(`/workouts/${workoutId}/summary`);
      }
    } catch (error) {
      console.error('Error logging performance:', error);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Workout Exercises</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h2>Log Your Workout</h2>
        {exercises.length > 0 && exercises[currentExerciseIndex] && (
          <IonCard key={exercises[currentExerciseIndex].id}>
            <IonItem>
              <IonLabel>
                <h2>{exercises[currentExerciseIndex].name}</h2>
                <p>Last Time: {previousLogs[exercises[currentExerciseIndex].id]?.sets || 0} sets, 
                   {previousLogs[exercises[currentExerciseIndex].id]?.reps || 0} reps, 
                   {previousLogs[exercises[currentExerciseIndex].id]?.weight || 0} kg
                </p>
              </IonLabel>
            </IonItem>

            <IonList>
              <IonItem>
                <IonLabel position="floating">Sets</IonLabel>
                <IonInput
                  type="number"
                  value={logs[exercises[currentExerciseIndex].id]?.sets || ''}
                  onIonChange={(e) =>
                    setLogs({
                      ...logs,
                      [exercises[currentExerciseIndex].id]: { 
                        ...logs[exercises[currentExerciseIndex].id], 
                        sets: parseInt(e.detail.value) || 0 
                      },
                    })
                  }
                />
              </IonItem>
              <IonItem>
                <IonLabel position="floating">Reps</IonLabel>
                <IonInput
                  type="number"
                  value={logs[exercises[currentExerciseIndex].id]?.reps || ''}
                  onIonChange={(e) =>
                    setLogs({
                      ...logs,
                      [exercises[currentExerciseIndex].id]: { 
                        ...logs[exercises[currentExerciseIndex].id], 
                        reps: parseInt(e.detail.value) || 0 
                      },
                    })
                  }
                />
              </IonItem>
              <IonItem>
                <IonLabel position="floating">Weight (kg)</IonLabel>
                <IonInput
                  type="number"
                  value={logs[exercises[currentExerciseIndex].id]?.weight || ''}
                  onIonChange={(e) =>
                    setLogs({
                      ...logs,
                      [exercises[currentExerciseIndex].id]: { 
                        ...logs[exercises[currentExerciseIndex].id], 
                        weight: parseFloat(e.detail.value) || 0 
                      },
                    })
                  }
                />
              </IonItem>
              <IonButton expand="block" onClick={() => handleLogPerformance(exercises[currentExerciseIndex].id)}>
                Log Performance
              </IonButton>
            </IonList>

            {/* Exercise Progress Graph */}
            <WorkoutProgressChart
              workoutExerciseId={exercises[currentExerciseIndex].id}
              workoutId={workoutId} // Pass workoutId here
            />
          </IonCard>
        )}
      </IonContent>
    </IonPage>
  );
};

export default WorkoutExercises;
