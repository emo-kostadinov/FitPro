import React, { useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonPopover } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { signOutUser } from '../firebase';

const Dashboard = ({ user }) => {
  const history = useHistory();
  const [showPopover, setShowPopover] = useState(false);
  const [popoverEvent, setPopoverEvent] = useState(null);

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
              <p><strong>Name:</strong> {user?.displayName || 'N/A'}</p>
              <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
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