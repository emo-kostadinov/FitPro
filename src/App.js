import React, { useEffect, useState } from 'react';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect } from 'react-router-dom';
import { initializeDatabase } from './database/database';
import Login from './pages/Login';
import Workouts from './pages/Workouts';

import '@ionic/react/css/core.css';

const App = () => {
  const [user, setUser] = useState(null); // Manage logged-in user state
  const [dbInitialized, setDbInitialized] = useState(false); // Track database initialization

  useEffect(() => {
    const initDB = async () => {
      try {
        await initializeDatabase();
        setDbInitialized(true); // Mark database as initialized
        console.log('Database initialized successfully.');
      } catch (error) {
        console.error('Error initializing database:', error);
      }
    };
    initDB();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  if (!dbInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          {user ? (
            <>
              {/* Authenticated user routes */}
              <Route path="/workouts" component={Workouts} exact />
              <Redirect from="/" to="/workouts" exact />
            </>
          ) : (
            <>
              {/* Public routes */}
              <Route path="/login" render={() => <Login onLoginSuccess={handleLoginSuccess} />} exact />
              <Redirect from="/" to="/login" exact />
            </>
          )}
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
