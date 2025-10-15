import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import './App.css'
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Route-level code splitting
const Login = lazy(() => import('./components/Login'));
const Reminders = lazy(() => import('./Reminders.jsx'));
const Home = lazy(() => import('./Home.jsx'));
const Form = lazy(() => import('./Form.jsx'));
const Reminderlist = lazy(() => import('./Reminderlist.jsx'));
const Mealsuggestions = lazy(() => import('./Mealsuggestions.jsx'));
const UserSettings = lazy(() => import('./UserSettings.jsx'));

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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<div className="loading-container"><div className="loading-spinner"></div><p>Loading...</p></div>}>
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
              <ProtectedRoute>
                <UserSettings />
              </ProtectedRoute>
            } />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App
