import React from 'react';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonIcon,
  IonText,
  IonButtons,
  IonBackButton,
  IonButton
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { barChart, fitness, body, statsChartOutline, barbellOutline, homeOutline, fitnessOutline, documentTextOutline } from 'ionicons/icons';

const Analytics = () => {
  const history = useHistory();

  const analyticsCards = [
    {
      title: 'Workout Statistics',
      icon: barChart,
      description: 'Track your workout progress and performance metrics',
      path: '/analytics/workout'
    },
    {
      title: 'Exercise Trends',
      icon: fitness,
      description: 'Analyze your exercise patterns and improvements',
      path: '/analytics/exercise'
    },
    {
      title: 'Biometric Progress',
      icon: body,
      description: 'Monitor your body metrics and health indicators',
      path: '/biometric-data'
    }
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/dashboard" />
          </IonButtons>
          <IonTitle>Analytics</IonTitle>
          <IonButtons slot="end">
            <IonButton routerLink="/dashboard">
              <IonIcon slot="icon-only" icon={homeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="mt-2">
          <IonText>
            <h2 className="text-center mb-2">Track Your Progress</h2>
          </IonText>
          
          <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {analyticsCards.map((card, index) => (
              <IonCard 
                key={index} 
                onClick={() => history.push(card.path)}
                style={{ cursor: 'pointer', transition: 'transform 0.2s', margin: 0 }}
                className="ion-activatable"
              >
                <IonCardHeader className="ion-text-center">
                  <IonIcon
                    icon={card.icon}
                    style={{
                      fontSize: '2rem',
                      color: 'var(--ion-color-primary)',
                      marginBottom: '8px'
                    }}
                  />
                  <h3 style={{ margin: '8px 0', color: 'var(--ion-text-color)' }}>
                    {card.title}
                  </h3>
                </IonCardHeader>
                <IonCardContent>
                  <p style={{ 
                    color: 'var(--ion-text-color)',
                    opacity: '0.8',
                    margin: 0,
                    textAlign: 'center' 
                  }}>
                    {card.description}
                  </p>
                </IonCardContent>
              </IonCard>
            ))}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Analytics;
