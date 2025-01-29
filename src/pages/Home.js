import React from 'react';
import { IonPage, IonContent, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem, IonLabel } from '@ionic/react';

const Home = () => (
  <IonPage>
    <IonContent>
      <h1>Welcome to FitPro!</h1>
      
      {/* Buttons */}
      <IonButton expand="full" color="primary">
        Get Started
      </IonButton>

      {/* Cards */}
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Workout Plan</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          Customize your workout plan to fit your goals!
        </IonCardContent>
      </IonCard>

      {/* Lists */}
      <IonList>
        <IonItem>
          <IonLabel>Push-Up</IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>Squat</IonLabel>
        </IonItem>
      </IonList>
    </IonContent>
  </IonPage>
);

export default Home;