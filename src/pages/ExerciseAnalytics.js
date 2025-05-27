import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonButtons,
  IonBackButton,
  IonSkeletonText,
  IonIcon,
  IonChip,
  IonLabel,
  IonText,
  IonButton
} from '@ionic/react';
import {
  pieChartOutline,
  barChartOutline,
  fitnessOutline,
  trendingUpOutline,
  refreshOutline
} from 'ionicons/icons';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { getExerciseStats } from '../database/database';
import { getAuth } from 'firebase/auth';

const COLORS = [
  '#4C6FFF', // Primary Blue
  '#45B6FE', // Light Blue
  '#FF6B6B', // Coral
  '#4ECDC4', // Turquoise
  '#96CEB4', // Sage
  '#FF9F1C', // Orange
  '#7048E8', // Purple
  '#2ECC71'  // Green
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '12px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{payload[0].name}</p>
        <p style={{ margin: '4px 0 0' }}>
          Count: <span style={{ color: payload[0].fill }}>{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const ExerciseAnalytics = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalExercises, setTotalExercises] = useState(0);
  const auth = getAuth();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.error('No user logged in');
        setError('Please log in to view exercise statistics');
        return;
      }
      const stats = await getExerciseStats(userId);
      setData(stats);
      setTotalExercises(stats.reduce((sum, item) => sum + item.count, 0));
      setError('');
    } catch (err) {
      console.error('Error fetching exercise stats:', err);
      setError('Failed to load exercise statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const renderLoadingState = () => (
    <IonCard>
      <IonCardContent>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <IonSkeletonText
            animated
            style={{
              width: '60%',
              height: '24px',
              margin: '0 auto 12px'
            }}
          />
          <IonSkeletonText
            animated
            style={{
              width: '40%',
              height: '18px',
              margin: '0 auto'
            }}
          />
        </div>
        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IonSkeletonText
            animated
            style={{
              width: '200px',
              height: '200px',
              borderRadius: '50%'
            }}
          />
        </div>
      </IonCardContent>
    </IonCard>
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/analytics" />
          </IonButtons>
          <IonTitle>Exercise Analytics</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {loading ? (
          renderLoadingState()
        ) : (
          <>
            {/* Stats Overview */}
            <IonCard>
              <IonCardHeader>
                <IonCardTitle style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IonIcon icon={pieChartOutline} />
                  Exercise Distribution
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div style={{ marginBottom: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <IonChip color="primary">
                    <IonIcon icon={fitnessOutline} />
                    <IonLabel>{data.length} Different Exercises</IonLabel>
                  </IonChip>
                  <IonChip color="success">
                    <IonIcon icon={barChartOutline} />
                    <IonLabel>{totalExercises} Total Sets</IonLabel>
                  </IonChip>
                </div>

                {data.length > 0 ? (
                  <div style={{ height: '400px', width: '100%' }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={data}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={150}
                          innerRadius={60}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={true}
                        >
                          {data.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                              style={{ filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.2))' }}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          layout="horizontal"
                          verticalAlign="bottom"
                          align="center"
                          wrapperStyle={{ paddingTop: '20px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div style={{ 
                    textAlign: 'center',
                    padding: '40px 20px'
                  }}>
                    <IonIcon
                      icon={fitnessOutline}
                      style={{
                        fontSize: '48px',
                        color: 'var(--ion-color-medium)',
                        marginBottom: '16px'
                      }}
                    />
                    <h2 style={{ margin: '0 0 8px', fontSize: '20px' }}>No Exercise Data</h2>
                    <p style={{ margin: '0 0 20px', opacity: '0.7' }}>
                      Start working out to see your exercise distribution
                    </p>
                    <IonButton routerLink="/workouts">
                      Start a Workout
                    </IonButton>
                  </div>
                )}
              </IonCardContent>
            </IonCard>

            {error && (
              <IonText color="danger" style={{ display: 'block', marginTop: '16px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 8px' }}>{error}</p>
                <IonButton
                  fill="clear"
                  onClick={fetchStats}
                  style={{ '--color': 'var(--ion-color-danger)' }}
                >
                  <IonIcon slot="start" icon={refreshOutline} />
                  Try Again
                </IonButton>
              </IonText>
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ExerciseAnalytics;
