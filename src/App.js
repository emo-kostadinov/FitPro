import React, { useEffect, useState } from 'react';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect } from 'react-router-dom';
import { initializeDatabase, isWebPlatform, saveProfile } from './database/database';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Workouts from './pages/Workouts';
import EditWorkout from './pages/EditWorkout';
import Logs from './pages/Logs';
import ProtectedRoute from './components/ProtectedRoute';
import Exercises from './pages/Exercises';
import WorkoutExercises from './pages/WorkoutExercises';
import ProfileCompletionForm from './components/ProfileCompletionForm';
import BiometricData from './pages/BiometricData';
import Analytics from './pages/Analytics';
import WorkoutAnalytics from './pages/WorkoutAnalytics';
import ExerciseAnalytics from './pages/ExerciseAnalytics';
import { onAuthStateChangedListener } from './firebase';

import '@ionic/react/css/core.css';
import './index.css';
import './theme/variables.css'

const App = () => {
  const [user, setUser] = useState(null); 
  const [dbInitialized, setDbInitialized] = useState(false); 

  useEffect(() => {
    const initDB = async () => {
      try {
        await initializeDatabase();
        setDbInitialized(true);
        console.log('Database initialized successfully.');
      } catch (error) {
        console.error('Error initializing database:', error);
      }
    };

    if (!isWebPlatform()) {
      initDB();
    } else {
      setDbInitialized(true);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener((user) => {
      if (user) {
        setUser(user);
        console.log("User signed in:", user);
      } else {
        setUser(null);
        console.log("No user signed in.");
      }
    });

    return () => unsubscribe();
  }, []);
  
  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleProfileComplete = async (profileData) => {
    try {
      if (!user?.uid) {
        console.warn("Cannot save profile: user.uid is undefined");
        return;
      }

      console.log("Saving profile for UID:", user.uid, profileData);
      await saveProfile(user.uid, profileData);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  if (!dbInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          {/* Public routes */}
          <Route path="/login" render={() => <Login onLoginSuccess={handleLoginSuccess} />} exact />
          <Route path="/complete-profile" render={() => <ProfileCompletionForm onComplete={handleProfileComplete} />} exact />

          {/* Protected routes */}
          <ProtectedRoute path="/dashboard" component={Dashboard} exact user={user} />
          <ProtectedRoute path="/workouts" component={Workouts} exact user={user} />
          <ProtectedRoute path="/logs" component={Logs} exact user={user} />
          <ProtectedRoute path="/biometric-data" component={BiometricData} exact user={user} />
          <ProtectedRoute path="/analytics" component={Analytics} exact user={user} />
          <ProtectedRoute path="/analytics/workout" component={WorkoutAnalytics} exact user={user} />
          <ProtectedRoute path="/analytics/exercise" component={ExerciseAnalytics} exact user={user} />
          <ProtectedRoute path="/edit-workout/:workoutId" component={EditWorkout} exact user={user} />
          <ProtectedRoute path="/exercises" component={Exercises} exact user={user} />
          <ProtectedRoute path="/workouts/:workoutId/exercises" component={WorkoutExercises} exact user={user} />

          {/* Redirects */}
          <Route exact path="/">
            {user ? <Redirect to="/workouts" /> : <Redirect to="/login" />}
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
