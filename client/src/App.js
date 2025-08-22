import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from './firebase';

// Import your components
import Signup from './components/Signup';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import SpreadsheetPage from './components/SpreadsheetPage'; 

import './App.css';

// --- ✅ COMPONENTS MOVED HERE ---
// Components should always be defined at the top level of the module.

// A simple component for the main page layout (header, content)
const AppLayout = () => {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        <h1>My Spreadsheet App</h1>
        {auth.currentUser && (
          <div>
            <span>{auth.currentUser.email}</span>
            <button onClick={handleSignOut} style={{ marginLeft: '15px' }}>Sign Out</button>
          </div>
        )}
      </header>
      <main style={{ marginTop: '20px' }}>
        <Outlet /> {/* Child routes will render here */}
      </main>
    </div>
  );
};

// A component for the authentication page
const AuthPage = () => (
  <div>
    <h2>Please sign in to continue</h2>
    <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
      <Signup />
      <Login />
    </div>
  </div>
);

// // A placeholder for the actual spreadsheet view
// const SpreadsheetPage = () => {
//     // This component will later get the spreadsheet ID from the URL
//     // and fetch the grid data.
//     return <h2>Spreadsheet View</h2>;
// };


// The main App component now only handles state and routing logic.
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <AuthPage />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
          <Route path="/spreadsheet/:id" element={user ? <SpreadsheetPage /> : <Navigate to="/" />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
