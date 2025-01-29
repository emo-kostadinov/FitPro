import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/react';
import { signInWithGoogle } from '../firebase';

const Login = ({ onLoginSuccess }) => {
  const handleGoogleLogin = async () => {
    try {
      const user = await signInWithGoogle();
      console.log('User signed in:', user);
      onLoginSuccess(user); // Pass user info to the parent or store it globally
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h2>Welcome to FitPro</h2>
        <IonButton expand="block" onClick={handleGoogleLogin}>
          Sign in with Google
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Login;
