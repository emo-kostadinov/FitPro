import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/react';
import { useHistory } from 'react-router-dom';

const Analytics = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Analytics</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="button-container">
          <IonButton expand="block" color="primary" onClick={() => history.push('/analytics/workout')}>
            Workout Statistics
          </IonButton>
          <IonButton expand="block" color="primary" onClick={() => history.push('/analytics/exercise')}>
            Exercise Trends
          </IonButton>
          <IonButton expand="block" color="primary" onClick={() => history.push('/biometric-data')}>
            Biometric Progress
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Analytics;
