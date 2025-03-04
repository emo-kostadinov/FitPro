import React, { useEffect, useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/react';
import { signInWithGoogle, onAuthStateChangedListener } from '../firebase';
import { useHistory } from 'react-router-dom';
import { getProfile } from '../database/database';

const Login = ({ onLoginSuccess }) => {
  const history = useHistory();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener(async (user) => {
      if (user) {
        setUser(user);
        const profile = await getProfile(user.uid);
        if (profile) {
          onLoginSuccess(user);
          history.push('/dashboard');
        } else {
          history.push('/complete-profile');
        }
      }
    });

    return () => unsubscribe();
  }, [history, onLoginSuccess]);

  const handleGoogleLogin = async () => {
    try {
      const user = await signInWithGoogle();
      setUser(user);
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
