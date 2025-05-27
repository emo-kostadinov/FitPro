import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getLogsForWorkoutExercise } from '../database/database';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/react';

const WorkoutProgressChart = ({ workoutId, workoutExerciseId, sessionId }) => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!workoutExerciseId) {
        console.warn("No workoutExerciseId provided, cannot fetch logs.");
        return;
      }

      try {
        const data = await getLogsForWorkoutExercise(workoutId, workoutExerciseId, sessionId);

        if (!data || data.length === 0) {
          setLogs([]);
          return;
        }

        // Format data for chart - track both weight and reps
        const formattedData = data.map((log) => ({
          date: new Date(log.date).toLocaleDateString(),
          weight: parseFloat(log.weight) || 0,
          reps: parseFloat(log.reps) || 0,
          sets: parseFloat(log.sets) || 0
        }));

        // Sort by date ascending
        formattedData.sort((a, b) => new Date(a.date) - new Date(b.date));
        setLogs(formattedData);
      } catch (error) {
        console.error("Error fetching logs:", error);
        setLogs([]);
      }
    };

    fetchLogs();
  }, [workoutId, workoutExerciseId, sessionId]);

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
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'Weight') return [`${value} kg`, name];
                  if (name === 'Reps') return [value, name];
                  return [value, name];
                }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="weight"
                name="Weight"
                stroke="#8884d8"
                strokeWidth={2}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="reps"
                name="Reps"
                stroke="#82ca9d"
                strokeWidth={2}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>No progress data available yet.</p>
        )}
      </IonCardContent>
    </IonCard>
  );
};

export default WorkoutProgressChart;