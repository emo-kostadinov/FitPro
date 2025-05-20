import React, { useEffect, useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getWorkoutStats } from '../database/database';

const WorkoutAnalytics = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      const stats = await getWorkoutStats();
      setData(stats);
    };

    fetchStats();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Workout Analytics</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <h2 style={{ textAlign: 'center' }}>Workouts per Day</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3dc2ff" />
          </BarChart>
        </ResponsiveContainer>
      </IonContent>
    </IonPage>
  );
};

export default WorkoutAnalytics;
