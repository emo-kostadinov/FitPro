import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonText,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonIcon,
  IonButtons,
  IonBackButton,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonChip,
  IonSkeletonText
} from '@ionic/react';
import {
  barChartOutline,
  calendarOutline,
  fitnessOutline,
  trendingUpOutline,
  timeOutline,
  flameOutline
} from 'ionicons/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { getWorkoutStats } from '../database/database';
import { getAuth } from 'firebase/auth';

const WorkoutAnalytics = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewType, setViewType] = useState('weekly');
  const [selectedMetric, setSelectedMetric] = useState('workouts');
  const [summaryStats, setSummaryStats] = useState({
    totalWorkouts: 0,
    avgDuration: 0,
    totalExercises: 0,
    streak: 0
  });
  const auth = getAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const userId = auth.currentUser?.uid;
        if (!userId) {
          console.error('No user logged in');
          return;
        }
        const stats = await getWorkoutStats(userId);
        setData(stats);
        
        // Calculate summary stats
        const total = stats.reduce((sum, day) => sum + day.count, 0);
        const avgDuration = stats.reduce((sum, day) => sum + (day.duration || 0), 0) / (stats.length || 1);
        const totalExercises = stats.reduce((sum, day) => sum + (day.exercises || 0), 0);
        
        setSummaryStats({
          totalWorkouts: total,
          avgDuration: Math.round(avgDuration),
          totalExercises,
          streak: calculateStreak(stats)
        });
      } catch (error) {
        console.error('Error fetching workout stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const calculateStreak = (stats) => {
    let streak = 0;
    const today = new Date();
    const sortedStats = [...stats].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    for (let i = 0; i < sortedStats.length; i++) {
      const date = new Date(sortedStats[i].date);
      const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));
      
      if (diffDays === i && sortedStats[i].count > 0) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const renderSummaryCards = () => (
    <div className="analytics-summary">
      <IonCard className="summary-card">
        <IonCardContent>
          <div className="summary-icon">
            <IonIcon icon={fitnessOutline} />
          </div>
          <div className="summary-info">
            <h3>{summaryStats.totalWorkouts}</h3>
            <p>Total Workouts</p>
          </div>
        </IonCardContent>
      </IonCard>

      <IonCard className="summary-card">
        <IonCardContent>
          <div className="summary-icon">
            <IonIcon icon={timeOutline} />
          </div>
          <div className="summary-info">
            <h3>{summaryStats.avgDuration}m</h3>
            <p>Avg Duration</p>
          </div>
        </IonCardContent>
      </IonCard>

      <IonCard className="summary-card">
        <IonCardContent>
          <div className="summary-icon">
            <IonIcon icon={flameOutline} />
          </div>
          <div className="summary-info">
            <h3>{summaryStats.streak}</h3>
            <p>Day Streak</p>
          </div>
        </IonCardContent>
      </IonCard>

      <IonCard className="summary-card">
        <IonCardContent>
          <div className="summary-icon">
            <IonIcon icon={barChartOutline} />
          </div>
          <div className="summary-info">
            <h3>{summaryStats.totalExercises}</h3>
            <p>Total Exercises</p>
          </div>
        </IonCardContent>
      </IonCard>
    </div>
  );

  const renderChart = () => {
    if (data.length === 0) {
      return (
        <div className="empty-analytics">
          <IonIcon icon={barChartOutline} />
          <h2>No Data Available</h2>
          <p>Start logging workouts to see your analytics here!</p>
        </div>
      );
    }

    const ChartComponent = selectedMetric === 'duration' ? LineChart : BarChart;
    const DataComponent = selectedMetric === 'duration' ? Line : Bar;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <ChartComponent data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="date"
            stroke="var(--ion-color-medium)"
            tick={{ fill: 'var(--ion-color-medium)' }}
          />
          <YAxis
            stroke="var(--ion-color-medium)"
            tick={{ fill: 'var(--ion-color-medium)' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--ion-card-background)',
              border: '1px solid var(--ion-color-medium)',
              borderRadius: '8px'
            }}
            labelStyle={{ color: 'var(--ion-color-medium)' }}
          />
          <Legend />
          <DataComponent
            dataKey={selectedMetric === 'duration' ? 'duration' : 'count'}
            fill="var(--ion-color-primary)"
            stroke="var(--ion-color-primary)"
            name={selectedMetric === 'duration' ? 'Duration (mins)' : 'Workouts'}
          />
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/workouts" />
          </IonButtons>
          <IonTitle>Analytics</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {isLoading ? (
          <div className="analytics-loading">
            <div className="analytics-summary">
              {[...Array(4)].map((_, i) => (
                <IonCard key={i} className="summary-card">
                  <IonCardContent>
                    <IonSkeletonText animated style={{ width: '40px', height: '40px' }} />
                    <div className="summary-info">
                      <IonSkeletonText animated style={{ width: '60%' }} />
                      <IonSkeletonText animated style={{ width: '40%' }} />
                    </div>
                  </IonCardContent>
                </IonCard>
              ))}
            </div>
            <div className="chart-container">
              <IonSkeletonText animated style={{ width: '100%', height: '300px' }} />
            </div>
          </div>
        ) : (
          <>
            {renderSummaryCards()}

            <div className="chart-container">
              <div className="chart-header">
                <h2>
                  <IonIcon icon={trendingUpOutline} />
                  Progress Overview
                </h2>
                
                <div className="chart-controls">
                  <IonSegment 
                    value={viewType}
                    onIonChange={e => setViewType(e.detail.value)}
                  >
                    <IonSegmentButton value="weekly">
                      <IonLabel>Week</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="monthly">
                      <IonLabel>Month</IonLabel>
                    </IonSegmentButton>
                  </IonSegment>

                  <div className="metric-selector">
                    <IonChip 
                      color={selectedMetric === 'workouts' ? 'primary' : 'medium'}
                      onClick={() => setSelectedMetric('workouts')}
                    >
                      <IonIcon icon={fitnessOutline} />
                      <IonLabel>Workouts</IonLabel>
                    </IonChip>
                    <IonChip 
                      color={selectedMetric === 'duration' ? 'primary' : 'medium'}
                      onClick={() => setSelectedMetric('duration')}
                    >
                      <IonIcon icon={timeOutline} />
                      <IonLabel>Duration</IonLabel>
                    </IonChip>
                  </div>
                </div>
              </div>

              {renderChart()}
            </div>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default WorkoutAnalytics;
