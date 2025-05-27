import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonPopover,
  IonIcon,
  IonAvatar,
  IonItem,
  IonLabel,
  IonChip,
  IonBadge,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonButtons
} from '@ionic/react';
import {
  barbell,
  clipboard,
  analytics,
  fitness,
  person,
  trendingUp,
  time,
  calendar,
  barbellOutline,
  fitnessOutline,
  statsChartOutline,
  documentTextOutline,
  logOutOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { signOutUser, onAuthStateChangedListener } from '../firebase';
import { getProfile } from '../database/database';

const Dashboard = () => {
  const history = useHistory();
  const [showPopover, setShowPopover] = useState(false);
  const [popoverEvent, setPopoverEvent] = useState(null);
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);

  // Listen for authenticated user
  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        setUser(null);
        history.push('/login');
      }
    });
    return () => unsubscribe();
  }, [history]);

  // Load profile data from database when user is available
  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.uid) {
        const profileData = await getProfile(user.uid);
        setProfile(profileData);
      }
    };
    fetchProfile();
  }, [user]);

  const handleProfileClick = (event) => {
    setPopoverEvent(event.nativeEvent);
    setShowPopover(true);
  };

  const handleLogout = async () => {
    await signOutUser();
    history.push('/login');
  };

  const quickActions = [
    { title: 'Start Workout', icon: barbell, path: '/workouts', color: 'primary' },
    { title: 'View Exercises', icon: fitness, path: '/exercises', color: 'primary' },
    { title: 'Check Progress', icon: analytics, path: '/analytics', color: 'primary' },
    { title: 'View Logs', icon: clipboard, path: '/logs', color: 'primary' }
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Dashboard</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleLogout}>
              <IonIcon slot="icon-only" icon={logOutOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Welcome Section */}
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
            Welcome back, {profile?.name || user?.displayName || 'User'}!
          </h1>
          <p style={{ 
            margin: '16px 0 0', 
            fontSize: '20px',
            opacity: 0.8 
          }}>
            Ready for today's workout?
          </p>
        </div>

        {/* Quick Actions Stack */}
        <div style={{ 
          width: '100%',
          maxWidth: '400px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {quickActions.map((action, index) => (
            <IonCard 
              key={index}
              onClick={() => history.push(action.path)}
              style={{ 
                margin: 0,
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              className="ion-activatable"
            >
              <IonCardContent style={{ 
                display: 'flex',
                alignItems: 'center',
                padding: '16px'
              }}>
                <IonIcon
                  icon={action.icon}
                  style={{
                    fontSize: '24px',
                    color: 'var(--ion-color-primary)',
                    marginRight: '16px'
                  }}
                />
                <span style={{ 
                  fontSize: '16px',
                  fontWeight: '500'
                }}>
                  {action.title}
                </span>
              </IonCardContent>
            </IonCard>
          ))}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;
