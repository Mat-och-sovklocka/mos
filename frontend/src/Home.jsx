import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./home.css";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import NotificationTest from './components/NotificationTest';

// Helper function to translate user types to Swedish (for UI display)
const translateUserType = (userType) => {
  switch (userType) {
    case 'ADMIN':
      return 'Administratör';
    case 'CAREGIVER':
      return 'Vårdgivare';
    case 'RESIDENT':
      return 'Boende';
    default:
      return userType;
  }
};


const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const viewedPatientName = location?.state?.viewedPatientName || null;
  const [permissions, setPermissions] = useState([]);

  const { getAuthHeaders } = useAuth();

  useEffect(() => {
    async function loadPermissions() {
      if (!user) return;
      if (user.userType === 'RESIDENT') {
        try {
          const res = await fetch('/api/user-management/permissions', { headers: getAuthHeaders() });
          if (res.ok) {
            const data = await res.json();
            // backend may return array of permission objects or strings; normalize to string keys
            if (Array.isArray(data)) {
              const normalized = data.map(item => typeof item === 'string' ? item : item.permission_name || item.name || item.key).filter(Boolean);
              setPermissions(normalized);
            } else {
              setPermissions([]);
            }
          } else {
            setPermissions([]);
          }
        } catch (err) {
          console.warn('Could not load permissions', err);
          setPermissions([]);
        }
      }
    }
    loadPermissions();
  }, [user, getAuthHeaders]);

  // helper to check permission
  function hasPerm(key) {
    if (!permissions || permissions.length === 0) return false;
    return permissions.includes(key);
  }
  
  // Map UI items to required permission keys for residents
  const items = [
    { className: "allergies", label: "Allergier och specialkost", link: "/form", perm: 'MEAL_REQUIREMENTS' },
  // Settings should only be accessible to ADMIN/CAREGIVER (not RESIDENT)
  { className: "settings", label: "Inställningar", link: "/UserSettings", perm: null },
    { className: "recepies", label: "Matförslag", link: "/mealsuggestions", perm: 'MEAL_SUGGESTIONS' },
    { className: "reminders_handle", label: "Lägg påminnelser", link: "/reminders", perm: 'CREATE_REMINDERS' },
    { className: "reminders_list", label: "Påminnelselista", link: "/reminderlist", perm: 'VIEW_REMINDERS' },
    { className: "statistics", label: "Statistik", link: "/statistics", perm: 'STATISTICS' },
  ];

  return (
    <div className="container-fluid min-vh-100 d-flex flex-column justify-content-start align-items-center pt-5">
      {/* User Info and Logout */}
      <div className="d-flex justify-content-between align-items-center w-100 mb-3 px-3">
        <div className="user-info">
          <span className="text-muted">Inloggad som: </span>
          <strong style={{ color: '#316e70' }}>{user?.displayName || user?.email}</strong>
          <span className="badge bg-primary ms-2" style={{ fontSize: '11px' }}>{translateUserType(user?.userType)}</span>
          {viewedPatientName && (
            <div style={{ marginTop: '8px', padding: '6px 8px', backgroundColor: '#e8f4f8', borderRadius: '4px', border: '1px solid #316e70', display: 'inline-block' }}>
              <strong style={{ color: '#316e70', fontSize: '14px' }}>👤 Patient: {viewedPatientName}</strong>
            </div>
          )}
        </div>
        <button 
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="btn btn-outline-danger btn-sm"
        >
          Logout
        </button>
      </div>
      
      <h1 className="display-4 text-center mb-5 app-title fw-bold mt-4">
        Mat och sov appen
      </h1>

      {/* Patient context banner */}
      {viewedPatientName && (
        <div style={{ 
          textAlign: 'center', 
          margin: '0 auto 40px auto', 
          padding: '16px 24px', 
          backgroundColor: '#e8f4f8', 
          border: '2px solid #316e70', 
          borderRadius: '12px', 
          maxWidth: '700px',
          fontSize: '18px',
          fontWeight: '600',
          color: '#316e70',
          boxShadow: '0 2px 8px rgba(49, 110, 112, 0.1)'
        }}>
          🏠 Du navigerar i <strong>{viewedPatientName}s</strong> gränssnitt
          <div style={{ fontSize: '14px', marginTop: '8px', fontWeight: '400', color: '#2a5a5c' }}>
            Alla moduler du använder kommer att påverka denna patients data
          </div>
        </div>
      )}

      <div className="row justify-content-center w-100">
        {items.map(({ className, label, link, perm }) => (
          <div
            key={className}
            className="col-12 col-sm-6 col-lg-4 d-flex flex-column align-items-center mb-4"
          >
            {user?.userType === 'RESIDENT' ? (
              // Residents: show active icon only if they have the permission; otherwise show disabled icon
              perm ? (
                hasPerm(perm) ? (
                  <Link to={link} state={location.state}>
                    <div className={`image ${className}`}></div>
                  </Link>
                ) : (
                  <div className={`image ${className} disabled-home`} title="Du har inte behörighet till denna modul" aria-label="Otillgänglig modul" />
                )
              ) : (
                // Items without a permission requirement: Settings should be disabled for residents
                className === 'settings' ? (
                  <div className={`image ${className} disabled-home`} title="Inte tillgänglig för residents" aria-label="Otillgänglig för residents" />
                ) : (
                  link ? (
                    <Link to={link} state={location.state}>
                      <div className={`image ${className}`}></div>
                    </Link>
                  ) : (
                    <div className={`image ${className}`}></div>
                  )
                )
              )
            ) : (
              // Non-residents: unchanged behavior
              link ? (
                <Link to={link} state={location.state}>
                  <div className={`image ${className}`}></div>
                </Link>
              ) : (
                <div className={`image ${className}`}></div>
              )
            )}
            <span className="mt-2 text-center label-text">{label}</span>
          </div>
        ))}
      </div>
      
      {/* Notification Test Component */}
      <div className="container mt-5">
        <NotificationTest />
      </div>
    </div>
  );
};

export default Home;
