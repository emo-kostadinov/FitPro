import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/react';

const Logs = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Logs</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <h1>Track your logs here!</h1>
        <p>Feature coming soon.</p>
      </IonContent>
    </IonPage>
  );
};

export default Logs;