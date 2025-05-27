import React, { useState } from 'react';
import {  IonPage,  IonHeader,  IonToolbar,  IonTitle,  IonContent,  IonInput,  IonButton,  IonItem,  IonLabel, IonText } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { profileSchema } from '../validations/validationSchemas';

const ProfileCompletionForm = ({ onComplete }) => {
  const history = useHistory();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = async () => {
    try {
      // Clear previous errors
      setErrors({});
      
      // Validate the form data
      await profileSchema.validate({
        name,
        age,
        height,
        weight
      }, { abortEarly: false });

      const profileData = {
        name,
        age: parseInt(age, 10),
        height: parseFloat(height),
        weight: parseFloat(weight),
      };

      await onComplete(profileData); // Save profile data
      history.push('/dashboard');
    } catch (error) {
      if (error.inner) {
        // Handle validation errors
        const newErrors = {};
        error.inner.forEach((validationError) => {
          newErrors[validationError.path] = validationError.message;
        });
        setErrors(newErrors);
      } else {
        console.error('Error completing profile:', error);
        alert('There was a problem saving your profile.');
      }
    }
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
            className={errors.name ? 'ion-invalid' : ''}
          />
        </IonItem>
        {errors.name && <IonText color="danger" className="ion-padding-start">{errors.name}</IonText>}

        <IonItem>
          <IonLabel position="floating">Age</IonLabel>
          <IonInput
            type="number"
            value={age}
            onIonChange={(e) => setAge(e.detail.value)}
            className={errors.age ? 'ion-invalid' : ''}
          />
        </IonItem>
        {errors.age && <IonText color="danger" className="ion-padding-start">{errors.age}</IonText>}

        <IonItem>
          <IonLabel position="floating">Height (cm)</IonLabel>
          <IonInput
            type="number"
            value={height}
            onIonChange={(e) => setHeight(e.detail.value)}
            className={errors.height ? 'ion-invalid' : ''}
          />
        </IonItem>
        {errors.height && <IonText color="danger" className="ion-padding-start">{errors.height}</IonText>}

        <IonItem>
          <IonLabel position="floating">Weight (kg)</IonLabel>
          <IonInput
            type="number"
            value={weight}
            onIonChange={(e) => setWeight(e.detail.value)}
            className={errors.weight ? 'ion-invalid' : ''}
          />
        </IonItem>
        {errors.weight && <IonText color="danger" className="ion-padding-start">{errors.weight}</IonText>}

        <IonButton expand="block" onClick={handleSubmit} className="ion-margin-top">
          Save Profile
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default ProfileCompletionForm;