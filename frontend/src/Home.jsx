import React, { useState } from "react";
import "./home.css";

const Home = () => {
  const [text, setText] = useState("");
  return (
    <div className="ring">
      <div className="text-container">
        <span className="text">{text}</span>
      </div>

      <div
        className="image allergies"
        onMouseOver={() => {
          setText("Allergier och specialkost");
        }}
      >
      </div>

      <div
        className="image home"
        onMouseOver={() => {
          setText("Home");
        }}
      >
        
      </div>
      <div
        className="image recepies"
        onMouseOver={() => {
          setText("Matförslag");
        }}
      >
      </div>
      <div
        className="image reminders_handle"
        onMouseOver={() => {
          setText("Lägg påminnelser");
        }}
      >
      </div>
      <div
        className="image reminders_list"
        onMouseOver={() => {
          setText("Påminnelselista");
        }}
      >
      </div>
      <div
        className="image statistics"
        onMouseOver={() => {
          setText("Statistik");
        }}
      >
      </div>
    </div>
  );
};

export default Home;
