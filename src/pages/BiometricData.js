import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonSkeletonText,
  IonButtons,
  IonBackButton,
  IonGrid,
  IonRow,
  IonCol,
  IonChip
} from '@ionic/react';
import {
  scaleOutline,
  trendingUpOutline,
  calendarOutline,
  addOutline,
  closeOutline,
  saveOutline,
  personOutline
} from 'ionicons/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getBiometricLogs, addBiometricLog } from '../database/database';
import { biometricSchema } from '../validations/validationSchemas';
import { getAuth } from 'firebase/auth';
import { useHistory } from 'react-router-dom';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
};

const BiometricData = () => {
  const history = useHistory();
  const auth = getAuth();
  const [logs, setLogs] = useState([]);
  const [newWeight, setNewWeight] = useState('');
  const [newHeight, setNewHeight] = useState('');
  const [loading, setLoading] = useState(true);
  const [weightError, setWeightError] = useState('');
  const [heightError, setHeightError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch biometric logs data
  const fetchData = async () => {
    setLoading(true);
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.error('No user logged in');
        history.push('/login');
        return;
      }

      const biometricData = await getBiometricLogs(userId);
      // Sort data by date and format dates
      const formattedData = (biometricData || []).map(log => ({
        ...log,
        date: formatDate(log.date),
        bmi: calculateBMI(log.weight, log.height)
      })).sort((a, b) => new Date(b.date) - new Date(a.date));
      setLogs(formattedData);
    } catch (error) {
      console.error('Error fetching biometric data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getBMICategory = (bmi) => {
    if (!bmi) return null;
    if (bmi < 18.5) return { label: 'Underweight', color: 'warning' };
    if (bmi < 25) return { label: 'Normal', color: 'success' };
    if (bmi < 30) return { label: 'Overweight', color: 'warning' };
    return { label: 'Obese', color: 'danger' };
  };

  const getLatestMetrics = () => {
    if (logs.length === 0) return null;
    const latest = logs[0];
    const bmi = calculateBMI(latest.weight, latest.height);
    return {
      weight: latest.weight,
      height: latest.height,
      bmi,
      bmiCategory: getBMICategory(bmi)
    };
  };

  const handleAddLog = async () => {
    setWeightError('');
    setHeightError('');

    const weightVal = newWeight === '' ? null : parseFloat(newWeight);
    const heightVal = newHeight === '' ? null : parseFloat(newHeight);

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.error('No user logged in');
        history.push('/login');
        return;
      }

      await biometricSchema.validate({ weight: weightVal, height: heightVal }, { abortEarly: false });

      if (weightVal !== null || heightVal !== null) {
        await addBiometricLog(userId, heightVal || 0, weightVal || 0);
        setNewWeight('');
        setNewHeight('');
        setShowAddForm(false);
        await fetchData();
      }
    } catch (err) {
      if (err.inner) {
        err.inner.forEach((validationError) => {
          if (validationError.path === 'weight') setWeightError(validationError.message);
          if (validationError.path === 'height') setHeightError(validationError.message);
        });
      } else {
        console.error('Validation error:', err);
      }
    }
  };

  const renderLoadingState = () => (
    <>
      <IonCard>
        <IonCardContent>
          <IonGrid>
            <IonRow>
              {[1, 2, 3].map((i) => (
                <IonCol key={i} size="4">
                  <div style={{ textAlign: 'center' }}>
                    <IonSkeletonText animated style={{ width: '40px', height: '40px', margin: '0 auto' }} />
                    <IonSkeletonText animated style={{ width: '80%', height: '20px', margin: '8px auto' }} />
                    <IonSkeletonText animated style={{ width: '60%', height: '16px', margin: '4px auto' }} />
                  </div>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        </IonCardContent>
      </IonCard>
      <IonCard>
        <IonCardContent>
          <IonSkeletonText animated style={{ width: '100%', height: '200px' }} />
        </IonCardContent>
      </IonCard>
    </>
  );

  const latestMetrics = getLatestMetrics();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/dashboard" />
          </IonButtons>
          <IonTitle>Biometric Data</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowAddForm(!showAddForm)}>
              <IonIcon icon={showAddForm ? closeOutline : addOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {loading ? (
          renderLoadingState()
        ) : (
          <>
            {/* Latest Metrics Card */}
            <IonCard>
              <IonCardHeader>
                <IonCardTitle style={{ fontSize: '18px' }}>Current Metrics</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonGrid>
                  <IonRow>
                    <IonCol size="4">
                      <div style={{ textAlign: 'center' }}>
                        <IonIcon
                          icon={scaleOutline}
                          style={{
                            fontSize: '24px',
                            color: 'var(--ion-color-primary)',
                            marginBottom: '8px'
                          }}
                        />
                        <h3 style={{ margin: '0', fontSize: '20px', fontWeight: 'bold' }}>
                          {latestMetrics?.weight || '--'}
                        </h3>
                        <p style={{ margin: '4px 0 0', opacity: '0.7', fontSize: '14px' }}>
                          Weight (kg)
                        </p>
                      </div>
                    </IonCol>
                    <IonCol size="4">
                      <div style={{ textAlign: 'center' }}>
                        <IonIcon
                          icon={personOutline}
                          style={{
                            fontSize: '24px',
                            color: 'var(--ion-color-primary)',
                            marginBottom: '8px'
                          }}
                        />
                        <h3 style={{ margin: '0', fontSize: '20px', fontWeight: 'bold' }}>
                          {latestMetrics?.height || '--'}
                        </h3>
                        <p style={{ margin: '4px 0 0', opacity: '0.7', fontSize: '14px' }}>
                          Height (cm)
                        </p>
                      </div>
                    </IonCol>
                    <IonCol size="4">
                      <div style={{ textAlign: 'center' }}>
                        <IonIcon
                          icon={trendingUpOutline}
                          style={{
                            fontSize: '24px',
                            color: 'var(--ion-color-primary)',
                            marginBottom: '8px'
                          }}
                        />
                        <h3 style={{ margin: '0', fontSize: '20px', fontWeight: 'bold' }}>
                          {latestMetrics?.bmi || '--'}
                        </h3>
                        <p style={{ margin: '4px 0 0', opacity: '0.7', fontSize: '14px' }}>
                          BMI
                        </p>
                      </div>
                    </IonCol>
                  </IonRow>
                  {latestMetrics?.bmiCategory && (
                    <IonRow>
                      <IonCol>
                        <div style={{ textAlign: 'center', marginTop: '16px' }}>
                          <IonChip color={latestMetrics.bmiCategory.color}>
                            <IonLabel>{latestMetrics.bmiCategory.label}</IonLabel>
                          </IonChip>
                        </div>
                      </IonCol>
                    </IonRow>
                  )}
                </IonGrid>
              </IonCardContent>
            </IonCard>

            {/* Add New Entry Form */}
            {showAddForm && (
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle style={{ fontSize: '18px' }}>Add New Entry</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonItem>
                    <IonLabel position="stacked">Weight (kg)</IonLabel>
                    <IonInput
                      type="number"
                      value={newWeight}
                      onIonChange={(e) => setNewWeight(e.detail.value)}
                      placeholder="Enter weight"
                    />
                  </IonItem>
                  {weightError && (
                    <IonText color="danger" style={{ fontSize: '12px', marginLeft: '16px' }}>
                      {weightError}
                    </IonText>
                  )}

                  <IonItem style={{ marginTop: '16px' }}>
                    <IonLabel position="stacked">Height (cm)</IonLabel>
                    <IonInput
                      type="number"
                      value={newHeight}
                      onIonChange={(e) => setNewHeight(e.detail.value)}
                      placeholder="Enter height"
                    />
                  </IonItem>
                  {heightError && (
                    <IonText color="danger" style={{ fontSize: '12px', marginLeft: '16px' }}>
                      {heightError}
                    </IonText>
                  )}

                  <IonButton
                    expand="block"
                    onClick={handleAddLog}
                    disabled={!newWeight && !newHeight}
                    style={{ marginTop: '20px' }}
                  >
                    <IonIcon icon={saveOutline} slot="start" />
                    Save Entry
                  </IonButton>
                </IonCardContent>
              </IonCard>
            )}

            {/* Progress Charts */}
            {logs.length > 0 && (
              <>
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle style={{ fontSize: '18px' }}>Weight Progress</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <div style={{ height: '250px', width: '100%' }}>
                      <ResponsiveContainer>
                        <LineChart data={logs}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="date"
                            style={{ fontSize: '12px' }}
                          />
                          <YAxis
                            domain={['dataMin - 2', 'dataMax + 2']}
                            style={{ fontSize: '12px' }}
                          />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="weight"
                            stroke="var(--ion-color-primary)"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </IonCardContent>
                </IonCard>

                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle style={{ fontSize: '18px' }}>BMI Trend</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <div style={{ height: '250px', width: '100%' }}>
                      <ResponsiveContainer>
                        <LineChart data={logs}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="date"
                            style={{ fontSize: '12px' }}
                          />
                          <YAxis
                            domain={['dataMin - 1', 'dataMax + 1']}
                            style={{ fontSize: '12px' }}
                          />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="bmi"
                            stroke="#82ca9d"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </IonCardContent>
                </IonCard>
              </>
            )}

            {/* Empty State */}
            {!loading && logs.length === 0 && !showAddForm && (
              <IonCard>
                <IonCardContent className="ion-text-center">
                  <IonIcon
                    icon={scaleOutline}
                    style={{
                      fontSize: '48px',
                      color: 'var(--ion-color-medium)',
                      marginBottom: '16px'
                    }}
                  />
                  <h2 style={{ margin: '0 0 8px', fontSize: '20px' }}>No Data Yet</h2>
                  <p style={{ margin: '0 0 20px', opacity: '0.7' }}>
                    Start tracking your progress by adding your first entry
                  </p>
                  <IonButton onClick={() => setShowAddForm(true)}>
                    <IonIcon icon={addOutline} slot="start" />
                    Add First Entry
                  </IonButton>
                </IonCardContent>
              </IonCard>
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default BiometricData;