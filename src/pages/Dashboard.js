import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';

const Dashboard = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>FitPro Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h1>Welcome to FitPro!</h1>
        <p>Your fitness journey starts here. Choose an action below:</p>
        <IonCard button onClick={() => history.push('/workouts')}>
          <IonCardHeader>
            <IonCardTitle>Workouts</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>Manage your workouts and track your progress.</IonCardContent>
        </IonCard>
        <IonCard button onClick={() => history.push('/exercises')}>
          <IonCardHeader>
            <IonCardTitle>Exercises</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>Create and explore exercises.</IonCardContent>
        </IonCard>
        <IonCard button onClick={() => history.push('/logs')}>
          <IonCardHeader>
            <IonCardTitle>Logs</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>View your workout history and records.</IonCardContent>
        </IonCard>
        <IonCard button onClick={() => history.push('/analytics')}>
          <IonCardHeader>
            <IonCardTitle>Analytics</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>Visualize your fitness journey.</IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;
