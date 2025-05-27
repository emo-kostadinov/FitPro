import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonButton,
  IonToast,
  IonSpinner,
  IonText,
  IonIcon,
  IonImg,
  IonCard
} from '@ionic/react';
import { logoGoogle, barbell, fitness } from 'ionicons/icons';
import { signInWithGoogle, onAuthStateChangedListener } from '../firebase';
import { useHistory } from 'react-router-dom';
import { getProfile } from '../database/database';

const Login = ({ onLoginSuccess }) => {
  const history = useHistory();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

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
    setLoading(true);
    setErrorMessage('');

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
      setErrorMessage('Login failed. Please try again.');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: barbell,
      title: 'Track Workouts',
      description: 'Log and monitor your fitness progress'
    },
    {
      icon: fitness,
      title: 'Custom Exercises',
      description: 'Create and manage your exercise library'
    }
  ];

  return (
    <IonPage>
      <IonContent className="ion-padding" fullscreen>
        <div style={{
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          maxWidth: '400px',
          margin: '0 auto',
          padding: '20px'
        }}>
          {/* Logo and Title Section */}
          <div style={{
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: 'var(--ion-color-primary)',
              borderRadius: '20px',
              width: '80px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <IonIcon
                icon={fitness}
                style={{
                  fontSize: '40px',
                  color: 'white'
                }}
              />
            </div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              margin: '0 0 8px'
            }}>
              Welcome to FitPro
            </h1>
            <p style={{
              margin: '0',
              opacity: '0.7',
              fontSize: '16px'
            }}>
              Your personal fitness companion
            </p>
          </div>

          {/* Features Section */}
          <div style={{ marginBottom: '2rem' }}>
            {features.map((feature, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '1rem',
                  padding: '12px',
                  background: 'rgba(var(--ion-color-primary-rgb), 0.1)',
                  borderRadius: '12px'
                }}
              >
                <IonIcon
                  icon={feature.icon}
                  style={{
                    fontSize: '24px',
                    color: 'var(--ion-color-primary)',
                    marginRight: '12px'
                  }}
                />
                <div>
                  <h3 style={{
                    margin: '0 0 4px',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{
                    margin: '0',
                    fontSize: '14px',
                    opacity: '0.7'
                  }}>
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Login Button */}
          <IonButton
            expand="block"
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              '--border-radius': '12px',
              '--padding-top': '16px',
              '--padding-bottom': '16px',
              fontSize: '16px'
            }}
          >
            {loading ? (
              <IonSpinner name="dots" />
            ) : (
              <>
                <IonIcon icon={logoGoogle} slot="start" />
                Continue with Google
              </>
            )}
          </IonButton>

          {/* Error Message */}
          {errorMessage && (
            <IonText 
              color="danger" 
              className="ion-text-center"
              style={{ 
                display: 'block',
                marginTop: '1rem'
              }}
              aria-live="polite"
            >
              <p>{errorMessage}</p>
            </IonText>
          )}

          {/* Terms and Privacy */}
          <p style={{
            textAlign: 'center',
            fontSize: '12px',
            opacity: '0.7',
            marginTop: '1rem'
          }}>
            By continuing, you agree to our{' '}
            <a href="#" style={{ color: 'var(--ion-color-primary)' }}>Terms</a> and{' '}
            <a href="#" style={{ color: 'var(--ion-color-primary)' }}>Privacy Policy</a>
          </p>
        </div>

        <IonToast
          isOpen={showToast}
          message={errorMessage}
          duration={3000}
          color="danger"
          onDidDismiss={() => setShowToast(false)}
          position="top"
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;
