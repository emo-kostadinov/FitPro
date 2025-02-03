import React, { useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/react';
import { signInWithGoogle, onAuthStateChangedListener } from '../firebase';
import { useHistory } from 'react-router-dom';
import { getProfile } from '../database/database';

const Login = ({ onLoginSuccess }) => {
  const history = useHistory();

  // Check if the user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener(async (user) => {
      if (user) {
        console.log('User is already logged in:', user);
        const profile = await getProfile(user.uid);
        if (profile) {
          onLoginSuccess(user);
          history.push('/dashboard');
        } else {
          history.push('/complete-profile');
        }
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [history, onLoginSuccess]);

  const handleGoogleLogin = async () => {
    try {
      const user = await signInWithGoogle();
      const profile = await getProfile(user.uid);
      if (profile) {
        onLoginSuccess(user);
        history.push('/dashboard');
      } else {
        history.push('/complete-profile');
      }
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