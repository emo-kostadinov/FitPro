import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonAlert, IonCard, IonSpinner } from '@ionic/react';
import { getAllLogs, deleteLog } from '../database/database';

const Logs = () => {
  const [logs, setLogs] = useState([]);
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

  const handleDeleteLog = async () => {
    if (logToDelete) {
      try {
        setIsLoading(true);
        await deleteLog(logToDelete);
        setLogs((prevLogs) => prevLogs.filter((log) => log.id !== logToDelete)); // Optimistically update the logs without refetching
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
        <h2>Workout Session Logs</h2>

        {isLoading && <IonSpinner name="crescent" />}

        <IonList>
          {logs.length > 0 ? (
            logs.map((log) => (
              <IonCard key={log.id}>
                <IonItem>
                  <IonLabel>
                    <h3>{log.date}</h3>
                    <p>Duration: {log.duration} min</p>
                    <p>Exercises: {log.exercises.join(', ')}</p>
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
            ))
          ) : (
            <IonItem><IonLabel>No logs available</IonLabel></IonItem>
          )}
        </IonList>

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
