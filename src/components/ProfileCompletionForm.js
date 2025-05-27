import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonButton,
  IonItem,
  IonLabel,
  IonText,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonList,
  IonIcon,
  IonButtons,
  IonBackButton
} from '@ionic/react';
import { personOutline, saveOutline } from 'ionicons/icons';
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
          <IonButtons slot="start">
            <IonBackButton defaultHref="/login" />
          </IonButtons>
          <IonTitle>Complete Your Profile</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        <div style={{ 
          textAlign: 'center',
          paddingTop: '32px',
          marginBottom: '48px'
        }}>
          <h1 style={{ 
            margin: '0', 
            fontSize: '32px',
            fontWeight: '600',
            color: 'var(--ion-color-primary)'
          }}>
            Welcome to FitPro!
          </h1>
          <p style={{ 
            margin: '16px 0 0', 
            fontSize: '20px',
            opacity: 0.8 
          }}>
            Let's set up your profile to get started
          </p>
        </div>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle className="ion-text-center">
              <IonIcon
                icon={personOutline}
                style={{
                  fontSize: '24px',
                  marginRight: '8px',
                  verticalAlign: 'middle'
                }}
              />
              Profile Information
            </IonCardTitle>
          </IonCardHeader>
          
          <IonCardContent>
            <IonList>
              <IonItem>
                <IonLabel position="floating">Full Name</IonLabel>
                <IonInput
                  type="text"
                  value={name}
                  onIonChange={(e) => setName(e.detail.value)}
                  className={errors.name ? 'ion-invalid' : ''}
                />
              </IonItem>
              {errors.name && <IonText color="danger" className="ion-padding-start"><small>{errors.name}</small></IonText>}

              <IonItem>
                <IonLabel position="floating">Age</IonLabel>
                <IonInput
                  type="number"
                  value={age}
                  onIonChange={(e) => setAge(e.detail.value)}
                  className={errors.age ? 'ion-invalid' : ''}
                />
              </IonItem>
              {errors.age && <IonText color="danger" className="ion-padding-start"><small>{errors.age}</small></IonText>}

              <IonItem>
                <IonLabel position="floating">Height (cm)</IonLabel>
                <IonInput
                  type="number"
                  value={height}
                  onIonChange={(e) => setHeight(e.detail.value)}
                  className={errors.height ? 'ion-invalid' : ''}
                />
              </IonItem>
              {errors.height && <IonText color="danger" className="ion-padding-start"><small>{errors.height}</small></IonText>}

              <IonItem>
                <IonLabel position="floating">Weight (kg)</IonLabel>
                <IonInput
                  type="number"
                  value={weight}
                  onIonChange={(e) => setWeight(e.detail.value)}
                  className={errors.weight ? 'ion-invalid' : ''}
                />
              </IonItem>
              {errors.weight && <IonText color="danger" className="ion-padding-start"><small>{errors.weight}</small></IonText>}
            </IonList>

            <IonButton 
              expand="block" 
              onClick={handleSubmit} 
              className="ion-margin-top"
              style={{ marginTop: '32px' }}
            >
              <IonIcon slot="start" icon={saveOutline} />
              Save Profile
            </IonButton>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default ProfileCompletionForm;