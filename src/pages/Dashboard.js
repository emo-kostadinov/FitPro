import React, { useState, useEffect } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonPopover
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { signOutUser, onAuthStateChangedListener } from '../firebase';
import { getProfile } from '../database/database';

const Dashboard = () => {
  const history = useHistory();
  const [showPopover, setShowPopover] = useState(false);
  const [popoverEvent, setPopoverEvent] = useState(null);
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null); // store Firebase user

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

  // Load profile data from localStorage or DB
  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.uid) {
        const profileData = await getProfile(user.uid);
        console.log("Profile fetched in Dashboard:", profileData);
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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>FitPro Dashboard</IonTitle>
          <IonButton slot="end" onClick={handleProfileClick}>
            Profile
          </IonButton>
          <IonPopover
            isOpen={showPopover}
            event={popoverEvent}
            onDidDismiss={() => setShowPopover(false)}
          >
            <IonContent className="ion-padding">
              <p><strong>Name:</strong> {profile?.name || user?.displayName || 'N/A'}</p>
              <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
              <IonButton expand="block" onClick={() => {
                setShowPopover(false);
                history.push('/biometric-data');
              }}>
                Biometric Data
              </IonButton>
              <IonButton expand="block" color="danger" onClick={handleLogout}>
                Logout
              </IonButton>
            </IonContent>
          </IonPopover>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <h1>Welcome to FitPro!</h1>
        <p>Your fitness journey starts here. Choose an action below:</p>

        <IonCard button onClick={() => history.push('/workouts')}>
          <IonCardHeader>
            <IonCardTitle>Workouts</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>Manage your workouts and track your progress.</IonCardContent>
        </IonCard>

        <IonCard button onClick={() => history.push('/exercises')}>
          <IonCardHeader>
            <IonCardTitle>Exercises</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>Create and explore exercises.</IonCardContent>
        </IonCard>

        <IonCard button onClick={() => history.push('/logs')}>
          <IonCardHeader>
            <IonCardTitle>Logs</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>View your workout history and records.</IonCardContent>
        </IonCard>

        <IonCard button onClick={() => history.push('/analytics')}>
          <IonCardHeader>
            <IonCardTitle>Analytics</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>Visualize your fitness journey.</IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;
