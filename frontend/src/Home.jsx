import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./home.css";
import { Link } from 'react-router-dom';
import NotificationTest from './components/NotificationTest';


const Home = () => {
  const items = [

    { className: "allergies", label: "Allergier och specialkost", link: "/form" },
    { className: "home", label: "Home" },
    { className: "recepies", label: "Matförslag", link: "/mealsuggestions" },
    {
      className: "reminders_handle",
      label: "Lägg påminnelser",
      link: "/reminders",
    },
    { className: "reminders_list", label: "Påminnelselista", link: "/reminderlist" },
    { className: "statistics", label: "Statistik" },
  ];

  return (
    <div className="container-fluid min-vh-100 d-flex flex-column justify-content-start align-items-center pt-5">
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
                <div className={`image ${className}`}></div>
              </Link>
            ) : (
              <div className={`image ${className}`}></div>
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
