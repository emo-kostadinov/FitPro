import React, { useState, useEffect } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonButton, IonAlert, IonCard,
  IonSpinner, IonSegment, IonSegmentButton,
} from '@ionic/react';
import { getAllLogs, deleteLog } from '../database/database';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState({});
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [logToDelete, setLogToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterMode, setFilterMode] = useState('default');

  // Fetch logs once on mount
  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const data = await getAllLogs();
        setLogs(data);
        setFilteredLogs(groupLogs(data, filterMode));
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // Regroup logs whenever logs or filterMode changes
  useEffect(() => {
    setFilteredLogs(groupLogs(logs, filterMode));
  }, [filterMode, logs]);

  const groupLogs = (data, mode) => {
    if (!data || data.length === 0) return {};

    if (mode === 'default') return { All: data };

    const groups = {};
    data.forEach((log) => {
      let key;
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

  const handleDeleteLog = async () => {
    if (logToDelete) {
      try {
        setIsLoading(true);
        await deleteLog(logToDelete);
        const updated = logs.filter((log) => log.id !== logToDelete);
        setLogs(updated);
        setFilteredLogs(groupLogs(updated, filterMode));
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
        <IonSegment value={filterMode} onIonChange={(e) => setFilterMode(e.detail.value)}>
          <IonSegmentButton value="default">
            <IonLabel>Default</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="workout">
            <IonLabel>By Workout</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="date">
            <IonLabel>By Date</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="exercise">
            <IonLabel>By Exercise</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="muscle">
            <IonLabel>By Muscle</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {isLoading ? (
          <IonSpinner name="crescent" />
        ) : (
          Object.entries(filteredLogs).length > 0 ? (
            Object.entries(filteredLogs).map(([groupName, logsInGroup]) => (
              <div key={groupName}>
                {filterMode !== 'default' && <h2>{groupName}</h2>}
                <IonList>
                  {logsInGroup.map((log) => (
                    <IonCard key={log.id}>
                      <IonItem>
                        <IonLabel>
                          <h3>{log.date ? new Date(log.date).toLocaleString() : 'No Date'}</h3>
                          <p><strong>Workout:</strong> {log.workoutName || 'Unknown Workout'}</p>
                          <p><strong>Exercise:</strong> {log.exerciseName || 'Unknown Exercise'}</p>
                          <p><strong>Muscle Group:</strong> {log.primaryMuscleGroup || 'N/A'}</p>
                          <p>
                            <strong>Sets:</strong> {log.sets}, <strong>Reps:</strong> {log.reps}, <strong>Weight:</strong> {log.weight} kg
                          </p>
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
              </div>
            ))
          ) : (
            <p style={{ padding: 16, textAlign: 'center' }}>No logs available.</p>
          )
        )}

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
