import React, { useEffect, useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonButton, IonItem, IonLabel } from '@ionic/react';
import { getProfile, saveProfile, getBiometricLogs, addBiometricLog } from '../database/database';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const BiometricData = ({ userId }) => {
  const [profile, setProfile] = useState({ name: '', age: null });
  const [logs, setLogs] = useState([]);
  const [newWeight, setNewWeight] = useState('');
  const [newHeight, setNewHeight] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const profileData = await getProfile(userId);
    const biometricData = await getBiometricLogs(userId);
    setProfile(profileData || {});
    setLogs(biometricData || []);
    setLoading(false);
  };

  const handleSaveName = async () => {
    await saveProfile(userId, { ...profile });
    await fetchData();
  };

  const handleAddLog = async () => {
    if (!newWeight && !newHeight) return;
    await addBiometricLog(userId, parseFloat(newHeight || 0), parseFloat(newWeight || 0));
    setNewWeight('');
    setNewHeight('');
    await fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Biometric Data</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {loading ? <p>Loading...</p> : (
          <>
            <IonItem>
              <IonLabel position="stacked">Name</IonLabel>
              <IonInput value={profile.name} onIonChange={(e) => setProfile({ ...profile, name: e.detail.value })} />
            </IonItem>
            <IonButton expand="block" onClick={handleSaveName}>Save Name</IonButton>

            <IonItem>
              <IonLabel position="stacked">New Weight (kg)</IonLabel>
              <IonInput type="number" value={newWeight} onIonChange={(e) => setNewWeight(e.detail.value)} />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">New Height (cm)</IonLabel>
              <IonInput type="number" value={newHeight} onIonChange={(e) => setNewHeight(e.detail.value)} />
            </IonItem>
            <IonButton expand="block" onClick={handleAddLog}>Add Biometric Entry</IonButton>

            {logs.length > 0 && (
              <>
                <h3 style={{ marginTop: '2rem' }}>Weight Progress</h3>
                <LineChart width={350} height={200} data={logs}>
                  <CartesianGrid stroke="#ccc" />
                  <XAxis dataKey="date" />
                  <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip />
                  <Line type="monotone" dataKey="weight" stroke="#8884d8" dot />
                </LineChart>

                <h3 style={{ marginTop: '2rem' }}>Height Progress</h3>
                <LineChart width={350} height={200} data={logs}>
                  <CartesianGrid stroke="#ccc" />
                  <XAxis dataKey="date" />
                  <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip />
                  <Line type="monotone" dataKey="height" stroke="#82ca9d" dot />
                </LineChart>
              </>
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default BiometricData;
