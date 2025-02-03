import React, { useEffect, useState } from 'react';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect, useHistory } from 'react-router-dom';
import { initializeDatabase, isWebPlatform, saveProfile } from './database/database';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Workouts from './pages/Workouts';
import ProtectedRoute from './components/ProtectedRoute';
import ProfileCompletionForm from './components/ProfileCompletionForm';
import { onAuthStateChangedListener } from './firebase';

import '@ionic/react/css/core.css';

const App = () => {
  const [user, setUser] = useState(null); 
  const [dbInitialized, setDbInitialized] = useState(false); 
  const history = useHistory();

  // Initialize database
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
      // Skip SQLite initialization for web
      setDbInitialized(true);
    }
  }, []);
  // Track user authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener((user) => {
      setUser(user); 
    });

    return () => unsubscribe(); 
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleProfileComplete = async (profileData) => {
    try {
      await saveProfile(user.uid, profileData);
      history.push('/dashboard');
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