import React from "react";
import "./home.css";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import NotificationTest from './components/NotificationTest';
import imgAllergies from './images/allergies.png';
import imgSettings from './images/settings.png';
import imgRecepies from './images/recepies.png';
import imgRemindersHandle from './images/reminders_handle.png';
import imgRemindersList from './images/reminders_list.png';
import imgStatistics from './images/statistics.png';


const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const items = [
    { className: "allergies", label: "Allergier och specialkost", link: "/form", src: imgAllergies },
    { className: "settings", label: "Inställningar", link: "/usersettings", src: imgSettings },
    { className: "recepies", label: "Matförslag", link: "/mealsuggestions", src: imgRecepies },
    { className: "reminders_handle", label: "Lägg påminnelser", link: "/reminders", src: imgRemindersHandle },
    { className: "reminders_list", label: "Påminnelselista", link: "/reminderlist", src: imgRemindersList },
    { className: "statistics", label: "Statistik", src: imgStatistics },
  ];

  return (
    <div className="container-fluid min-vh-100 d-flex flex-column justify-content-start align-items-center pt-5">
      {/* User Info and Logout */}
      <div className="d-flex justify-content-between align-items-center w-100 mb-3 px-3">
        <div className="user-info">
          <span className="text-muted">Welcome, </span>
          <strong>{user?.displayName || user?.email}</strong>
          <span className="badge bg-primary ms-2">{user?.userType}</span>
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

      <div className="row justify-content-center w-100">
        {items.map(({ className, label, link }) => (
          <div
            key={className}
            className="col-12 col-sm-6 col-lg-4 d-flex flex-column align-items-center mb-4"
          >
            {link ? (
              <Link to={link}>
                <div className={`image ${className}`}>
                  <img src={src} alt={label} loading="lazy" decoding="async" />
                </div>
              </Link>
            ) : (
              <div className={`image ${className}`}>
                <img src={src} alt={label} loading="lazy" decoding="async" />
              </div>
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
