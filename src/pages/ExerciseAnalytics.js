import React, { useEffect, useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { getExerciseStats } from '../database/database';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ExerciseAnalytics = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      const stats = await getExerciseStats();
      setData(stats);
    };

    fetchStats();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Exercise Analytics</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <h2 style={{ textAlign: 'center' }}>Most Frequent Exercises</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie dataKey="count" data={data} cx="50%" cy="50%" outerRadius={100} label>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </IonContent>
    </IonPage>
  );
};

export default ExerciseAnalytics;
