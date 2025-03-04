import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getLogsForWorkoutExercise } from '../database/database';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/react';

const WorkoutProgressChart = ({ workoutId, workoutExerciseId }) => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!workoutExerciseId) {
        console.warn("⚠️ No workoutExerciseId provided, cannot fetch logs.");
        return;
      }

      try {
        console.log("📌 workoutExerciseId:", workoutExerciseId);
        console.log("📌 workoutId:", workoutId);

        const data = await getLogsForWorkoutExercise(workoutId, workoutExerciseId);
        console.log("🔍 Raw fetched logs:", data);

        if (!data || data.length === 0) {
          console.warn("⚠️ No logs found for this exercise.");
          setLogs([]);  // Set an empty state
          return;
        }

        // Format data for chart
        const formattedData = data.map((log) => ({
          date: new Date(log.date).toLocaleDateString(),
          weight: parseFloat(log.weight) || 0
        }));

        console.log("Formatted Data for Chart:", formattedData);  // Debugging output
        setLogs(formattedData);
      } catch (error) {
        console.error("❌ Error fetching logs:", error);
        setLogs([]);  // Set to empty in case of error
      }
    };

    fetchLogs();
  }, [workoutId, workoutExerciseId]);

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Progress Over Time</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        {logs.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={logs}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Line type="monotone" dataKey="weight" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>No progress data available.</p>
        )}
      </IonCardContent>
    </IonCard>
  );
};

export default WorkoutProgressChart;
