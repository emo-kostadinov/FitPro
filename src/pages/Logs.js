import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonAlert,
  IonCard,
  IonSpinner,
  IonIcon,
  IonButtons,
  IonBackButton,
  IonFooter
} from '@ionic/react';
import {
  barbellOutline,
  fitnessOutline,
  calendarOutline,
  bodyOutline,
  trashOutline,
  documentTextOutline,
  homeOutline
} from 'ionicons/icons';
import { getAllLogs, deleteLog } from '../database/database';
import { getAuth } from 'firebase/auth';
import { useHistory } from 'react-router-dom';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [groupKeys, setGroupKeys] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [filterMode, setFilterMode] = useState(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [logToDelete, setLogToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const auth = getAuth();
  const history = useHistory();

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          console.error('No user logged in');
          history.push('/login');
          return;
        }
        const data = await getAllLogs(userId);
        setLogs(data);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  useEffect(() => {
    if (filterMode) {
      const grouped = groupLogs(logs, filterMode);
      setGroupKeys(Object.keys(grouped));
      setSelectedGroup(null);
      setFilteredLogs([]);
    }
  }, [filterMode]);

  useEffect(() => {
    if (selectedGroup && filterMode) {
      const grouped = groupLogs(logs, filterMode);
      setFilteredLogs(grouped[selectedGroup] || []);
    }
  }, [selectedGroup]);

  const groupLogs = (data, mode) => {
    const groups = {};
    data.forEach((log) => {
      let key = '';
      switch (mode) {
        case 'exercise':
          key = log.exerciseName || 'Unknown Exercise';
          break;
        case 'workout':
          key = log.workoutName || 'Unnamed Workout';
          break;
        case 'muscle':
          key = log.primaryMuscleGroup || 'Other';
          break;
        case 'date':
          key = log.date
            ? new Date(log.date).toLocaleDateString()
            : 'No Date';
          break;
        default:
          key = 'All';
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(log);
    });
    return groups;
  };

  const handleFilterChange = (mode) => {
    setFilterMode(mode);
  };

  const handleDeleteLog = async () => {
    if (logToDelete) {
      try {
        setIsLoading(true);
        await deleteLog(logToDelete);
        const updated = logs.filter((log) => log.id !== logToDelete);
        setLogs(updated);
        setFilteredLogs(filteredLogs.filter(log => log.id !== logToDelete));
        setLogToDelete(null);
      } catch (error) {
        console.error('Error deleting log:', error);
      } finally {
        setIsLoading(false);
      }
    }
    setShowDeleteAlert(false);
  };

  const getFilterIcon = (mode) => {
    switch (mode) {
      case 'workout':
        return barbellOutline;
      case 'exercise':
        return fitnessOutline;
      case 'muscle':
        return bodyOutline;
      case 'date':
        return calendarOutline;
      default:
        return documentTextOutline;
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/dashboard" />
          </IonButtons>
          <IonTitle>Workout Logs</IonTitle>
          <IonButtons slot="end">
            <IonButton routerLink="/dashboard">
              <IonIcon slot="icon-only" icon={homeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {isLoading && (
          <div className="ion-text-center ion-padding">
            <IonSpinner name="crescent" />
          </div>
        )}

        {!filterMode && (
          <div className="filter-buttons-container">
            <IonButton onClick={() => handleFilterChange('workout')}>
              <div className="ion-text-center">
                <IonIcon icon={barbellOutline} style={{ fontSize: '24px', marginBottom: '8px' }} />
                <div>By Workout</div>
              </div>
            </IonButton>
            <IonButton onClick={() => handleFilterChange('exercise')}>
              <div className="ion-text-center">
                <IonIcon icon={fitnessOutline} style={{ fontSize: '24px', marginBottom: '8px' }} />
                <div>By Exercise</div>
              </div>
            </IonButton>
            <IonButton onClick={() => handleFilterChange('muscle')}>
              <div className="ion-text-center">
                <IonIcon icon={bodyOutline} style={{ fontSize: '24px', marginBottom: '8px' }} />
                <div>By Muscle</div>
              </div>
            </IonButton>
            <IonButton onClick={() => handleFilterChange('date')}>
              <div className="ion-text-center">
                <IonIcon icon={calendarOutline} style={{ fontSize: '24px', marginBottom: '8px' }} />
                <div>By Date</div>
              </div>
            </IonButton>
          </div>
        )}

        {filterMode && !selectedGroup && (
          <>
            <h2 className="group-header">
              <IonIcon icon={getFilterIcon(filterMode)} style={{ marginRight: '8px' }} />
              Choose {filterMode.charAt(0).toUpperCase() + filterMode.slice(1)}
            </h2>
            <div className="ion-padding">
              {groupKeys.map((key) => (
                <IonButton key={key} expand="block" onClick={() => setSelectedGroup(key)}>
                  {key}
                </IonButton>
              ))}
            </div>
          </>
        )}

        {selectedGroup && (
          <>
            <h2 className="group-header">
              <IonIcon icon={getFilterIcon(filterMode)} style={{ marginRight: '8px' }} />
              {selectedGroup}
            </h2>

            {filteredLogs.length === 0 ? (
              <div className="empty-state">
                <IonIcon icon={documentTextOutline} />
                <h3>No Logs Found</h3>
                <p>There are no logs available for this selection.</p>
              </div>
            ) : (
              <IonList>
                {filteredLogs.map((log) => (
                  <IonCard key={`log-${log.id}-${log.date}`} className="log-card">
                    <IonItem lines="none">
                      <IonLabel>
                        <div className="log-header">
                          {log.date ? new Date(log.date).toLocaleString() : 'No Date'}
                        </div>
                        
                        <div className="log-detail">
                          <strong>Workout:</strong> {log.workoutName || 'Unknown Workout'}
                        </div>
                        <div className="log-detail">
                          <strong>Exercise:</strong> {log.exerciseName || 'Unknown Exercise'}
                        </div>
                        <div className="log-detail">
                          <strong>Muscle Group:</strong> {log.primaryMuscleGroup || 'N/A'}
                        </div>

                        <div className="log-stats">
                          <div className="stat-item">
                            <span className="stat-label">Sets</span>
                            <span className="stat-value">{log.sets}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Reps</span>
                            <span className="stat-value">{log.reps}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Weight</span>
                            <span className="stat-value">{log.weight} kg</span>
                          </div>
                        </div>

                        {log.notes && (
                          <div className="log-notes">
                            {log.notes}
                          </div>
                        )}
                      </IonLabel>
                      <IonButton
                        color="danger"
                        fill="clear"
                        onClick={() => {
                          setLogToDelete(log.id);
                          setShowDeleteAlert(true);
                        }}
                      >
                        <IonIcon slot="icon-only" icon={trashOutline} />
                      </IonButton>
                    </IonItem>
                  </IonCard>
                ))}
              </IonList>
            )}
          </>
        )}
      </IonContent>

      <IonFooter>
        <IonToolbar>
          <IonButtons style={{ display: 'flex', justifyContent: 'space-around' }}>
            <IonButton routerLink="/dashboard">
              <IonIcon slot="start" icon={homeOutline} />
              Dashboard
            </IonButton>
            <IonButton routerLink="/workouts">
              <IonIcon slot="start" icon={barbellOutline} />
              Workouts
            </IonButton>
            <IonButton routerLink="/exercises">
              <IonIcon slot="start" icon={fitnessOutline} />
              Exercises
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonFooter>

      <IonAlert
        isOpen={showDeleteAlert}
        onDidDismiss={() => setShowDeleteAlert(false)}
        header="Delete Log"
        message="Are you sure you want to delete this log entry?"
        buttons={[
          { text: 'Cancel', role: 'cancel' },
          { text: 'Delete', handler: handleDeleteLog },
        ]}
      />
    </IonPage>
  );
};

export default Logs;
