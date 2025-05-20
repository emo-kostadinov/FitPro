import React, { useState, useEffect } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonButton, IonAlert, IonCard,
  IonSpinner
} from '@ionic/react';
import { getAllLogs, deleteLog } from '../database/database';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [groupKeys, setGroupKeys] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [filterMode, setFilterMode] = useState(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [logToDelete, setLogToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const data = await getAllLogs();
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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Workout Logs</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">

        {/* Top-level filter buttons */}
        {!filterMode && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <IonButton expand="block" onClick={() => handleFilterChange('workout')}>By Workout</IonButton>
            <IonButton expand="block" onClick={() => handleFilterChange('exercise')}>By Exercise</IonButton>
            <IonButton expand="block" onClick={() => handleFilterChange('muscle')}>By Muscle</IonButton>
            <IonButton expand="block" onClick={() => handleFilterChange('date')}>By Date</IonButton>
          </div>
        )}

        {/* Group buttons (e.g., all workouts, all exercises...) */}
        {filterMode && !selectedGroup && (
          <div style={{ marginTop: 20 }}>
            <h2>Choose {filterMode}</h2>
            {groupKeys.map((key) => (
              <IonButton key={key} expand="block" onClick={() => setSelectedGroup(key)}>
                {key}
              </IonButton>
            ))}
            <IonButton color="medium" expand="block" onClick={() => setFilterMode(null)}>Back</IonButton>
          </div>
        )}

        {/* Logs for selected group */}
        {selectedGroup && filteredLogs.length > 0 && (
          <>
            <h2 style={{ marginTop: 20 }}>{selectedGroup}</h2>
            <IonList>
              {filteredLogs.map((log) => (
                <IonCard key={log.id}>
                  <IonItem>
                    <IonLabel>
                      <h3>{log.date ? new Date(log.date).toLocaleString() : 'No Date'}</h3>
                      <p><strong>Workout:</strong> {log.workoutName || 'Unknown Workout'}</p>
                      <p><strong>Exercise:</strong> {log.exerciseName || 'Unknown Exercise'}</p>
                      <p><strong>Muscle Group:</strong> {log.primaryMuscleGroup || 'N/A'}</p>
                      <p><strong>Sets:</strong> {log.sets}, <strong>Reps:</strong> {log.reps}, <strong>Weight:</strong> {log.weight} kg</p>
                      <p><strong>Duration:</strong> {log.duration} min</p>
                      <p><strong>Notes:</strong> {log.notes || 'None'}</p>
                    </IonLabel>
                    <IonButton
                      color="danger"
                      onClick={() => {
                        setLogToDelete(log.id);
                        setShowDeleteAlert(true);
                      }}
                    >
                      Delete
                    </IonButton>
                  </IonItem>
                </IonCard>
              ))}
            </IonList>
            <IonButton expand="block" color="medium" onClick={() => setSelectedGroup(null)}>Back</IonButton>
          </>
        )}

        {isLoading && <IonSpinner name="crescent" />}

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
      </IonContent>
    </IonPage>
  );
};

export default Logs;
