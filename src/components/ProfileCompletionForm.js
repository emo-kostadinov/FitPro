import React, { useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonButton, IonItem, IonLabel } from '@ionic/react';
import { useHistory } from 'react-router-dom';

const ProfileCompletionForm = ({ onComplete }) => {
  const history = useHistory();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  const handleSubmit = () => {
    const profileData = {
      name,
      age: parseInt(age, 10),
      height: parseFloat(height),
      weight: parseFloat(weight),
    };
    onComplete(profileData);
    history.push('/dashboard');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Complete Your Profile</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="floating">Full Name</IonLabel>
          <IonInput
            type="text"
            value={name}
            onIonChange={(e) => setName(e.detail.value)}
          />
        </IonItem>
        <IonItem>
          <IonLabel position="floating">Age</IonLabel>
          <IonInput
            type="number"
            value={age}
            onIonChange={(e) => setAge(e.detail.value)}
          />
        </IonItem>
        <IonItem>
          <IonLabel position="floating">Height (cm)</IonLabel>
          <IonInput
            type="number"
            value={height}
            onIonChange={(e) => setHeight(e.detail.value)}
          />
        </IonItem>
        <IonItem>
          <IonLabel position="floating">Weight (kg)</IonLabel>
          <IonInput
            type="number"
            value={weight}
            onIonChange={(e) => setWeight(e.detail.value)}
          />
        </IonItem>
        <IonButton expand="block" onClick={handleSubmit}>
          Save Profile
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default ProfileCompletionForm;