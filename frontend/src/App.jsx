import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import './App.css'
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Reminders from './Reminders.jsx'
import Home from './Home.jsx';
import Form from './Form.jsx';
import Reminderlist from './Reminderlist.jsx';
import Mealsuggestions from './Mealsuggestions.jsx';
import UserSettings from "./UserSettings.jsx"

import '@fortawesome/fontawesome-free/css/all.min.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  return isAuthenticated() ? children : <Login />;
};

// Role-based protected route: only allows users with one of the allowedRoles
const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading...</p>
    </div>
  );
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (!user || !allowedRoles.includes(user.userType)) {
    // Not allowed: redirect to home
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/reminders" element={
            <ProtectedRoute>
              <Reminders />
            </ProtectedRoute>
          } />
          <Route path="/form" element={
            <ProtectedRoute>
              <Form />
            </ProtectedRoute>
          } />
          <Route path="/reminderlist" element={
            <ProtectedRoute>
              <Reminderlist />
            </ProtectedRoute>
          } />
          <Route path="/mealsuggestions" element={
            <ProtectedRoute>
              <Mealsuggestions />
            </ProtectedRoute>
          } />
          <Route path="/UserSettings" element={
            <RoleProtectedRoute allowedRoles={["ADMIN","CAREGIVER"]}>
              <UserSettings />
            </RoleProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App
