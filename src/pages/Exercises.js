import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/react';

const Exercises = () => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Exercises</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent className="ion-padding">
      <p>Manage your exercises here.</p>
    </IonContent>
  </IonPage>
);

export default Exercises;