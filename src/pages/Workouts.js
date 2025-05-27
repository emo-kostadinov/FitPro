import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonAlert,
  IonFab,
  IonFabButton,
  IonSearchbar,
  IonChip,
  IonBadge,
  IonButtons,
  useIonAlert,
  IonBackButton
} from '@ionic/react';
import {
  addOutline,
  barbellOutline,
  createOutline,
  trashOutline,
  playOutline,
  analyticsOutline,
  timeOutline,
  calendarOutline,
  homeOutline,
  fitnessOutline,
  documentTextOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { addWorkout, getAllWorkouts, deleteWorkout } from '../database/database';
import { workoutSchema } from '../validations/validationSchemas';
import { getAuth } from 'firebase/auth';

const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [nameError, setNameError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState(null);
  const history = useHistory();
  const auth = getAuth();
  const [presentAlert] = useIonAlert();

  const fetchWorkouts = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.error('No user logged in');
        return;
      }
      const result = await getAllWorkouts(userId);
      setWorkouts(result);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    }
  };

  const handleAddWorkout = async (workoutName) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        presentAlert({
          header: 'Error',
          message: 'Please log in to add workouts',
          buttons: ['OK']
        });
        return;
      }

      if (!workoutName || !workoutName.trim()) {
        presentAlert({
          header: 'Error',
          message: 'Workout name is required',
          buttons: ['OK']
        });
        return;
      }

      await workoutSchema.validate({ name: workoutName });
      await addWorkout({ name: workoutName.trim(), archived: 0, userId });
      await fetchWorkouts();
      
      presentAlert({
        header: 'Success',
        message: 'Workout added successfully!',
        buttons: ['OK']
      });
    } catch (error) {
      presentAlert({
        header: 'Error',
        message: error.name === 'ValidationError' ? error.message : 'Failed to add workout. Please try again.',
        buttons: ['OK']
      });
    }
  };

  const handleDeleteWorkout = async () => {
    if (workoutToDelete) {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          presentAlert({
            header: 'Error',
            message: 'Please log in to delete workouts',
            buttons: ['OK']
          });
          return;
        }
        await deleteWorkout(workoutToDelete, userId);
        await fetchWorkouts();
        setWorkoutToDelete(null);
      } catch (error) {
        presentAlert({
          header: 'Error',
          message: 'Failed to delete workout. Please try again.',
          buttons: ['OK']
        });
      }
    }
  };

  const showAddWorkoutAlert = () => {
    presentAlert({
      header: 'Add New Workout',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Workout Name'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Add',
          handler: (data) => {
            handleAddWorkout(data.name);
          }
        }
      ]
    });
  };

  const confirmDelete = (workoutId) => {
    presentAlert({
      header: 'Delete Workout',
      message: 'Are you sure you want to delete this workout? This action cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => {
            setWorkoutToDelete(workoutId);
            handleDeleteWorkout();
          },
          cssClass: 'danger'
        }
      ]
    });
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const filteredWorkouts = workouts.filter(workout =>
    workout.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderWorkoutCard = (workout) => (
    <IonCard key={workout.id} className="workout-card">
      <IonCardHeader>
        <IonCardTitle className="workout-title">
          <div className="workout-icon-container">
            <IonIcon icon={barbellOutline} className="workout-icon" />
          </div>
          <span className="workout-name">{workout.name}</span>
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <div className="workout-actions">
          <IonButton 
            fill="solid" 
            color="primary"
            onClick={() => history.push(`/workouts/${workout.id}/exercises`)}
          >
            <IonIcon slot="start" icon={playOutline} />
            Start Workout
          </IonButton>
          
          <div className="secondary-actions">
            <IonButton 
              fill="clear"
              onClick={() => history.push(`/edit-workout/${workout.id}`)}
            >
              <IonIcon slot="icon-only" icon={createOutline} />
            </IonButton>
            
            <IonButton 
              fill="clear" 
              color="danger"
              onClick={() => confirmDelete(workout.id)}
            >
              <IonIcon slot="icon-only" icon={trashOutline} />
            </IonButton>
          </div>
        </div>
      </IonCardContent>
    </IonCard>
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/dashboard" />
          </IonButtons>
          <IonTitle>Workouts</IonTitle>
          <IonButtons slot="end">
            <IonButton routerLink="/dashboard">
              <IonIcon slot="icon-only" icon={homeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="search-container">
          <IonSearchbar
            value={searchText}
            onIonChange={e => setSearchText(e.detail.value)}
            placeholder="Search workouts"
            animated
          />
        </div>

        <div className="workouts-container">
          {filteredWorkouts.length > 0 ? (
            filteredWorkouts.map(renderWorkoutCard)
          ) : (
            <div className="empty-state">
              <IonIcon icon={barbellOutline} />
              <h2>No Workouts Found</h2>
              <p>{searchText ? 'Try a different search term' : 'Add your first workout to get started'}</p>
              <IonButton onClick={showAddWorkoutAlert}>
                <IonIcon slot="start" icon={addOutline} />
                Add Workout
              </IonButton>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Workouts;
