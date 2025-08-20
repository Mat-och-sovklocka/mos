import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { useState } from "react";
import img1 from "./images/img1.png";
import img2 from "./images/img2.png";
import img3 from "./images/img3.png";
import img4 from "./images/img4.png";
import img5 from "./images/img5.png";
import img6 from "./images/img6.png";
import img7 from "./images/img7.png";
import img8 from "./images/img8.png";
import "./reminder.css";

const images = [img1, img2, img3, img4, img5, img6, img7, img8];
const labels = [
  "Måltider",
  "Medicinintag",
  "Rörelse/pauser",
  "Vila/sömn",
  "Möte",
  "Dusch",
  "Städning",
  "Övrigt",
];

function Reminders() {
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const [reminderType, setReminderType] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(null);

  const activeIndex = selected !== null ? selected : hovered;
  const activeLabel = activeIndex !== null ? labels[activeIndex] : "";

  const handleClick = (type) => {
    setReminderType(type);
    if (type === "single") {
      setShowCalendar(true);
    } else {
      setShowCalendar(false);
      setSelectedDateTime(null);
    }
  };

  return (
    <div className="reminders-container">
      <h1>Påminnelser</h1>
      <p>
        För musmarkören över bilden för att se de olika typer av påminnelser.{" "}
        <br />
        Klicka sedan på den påminnelse du vill ställa.
      </p>

      <div className="reminder-textfield">{activeLabel}</div>

      <div className="reminders-grid">
        {images.map((img, i) => {
          let imgClass = "reminder-img";
          if (selected !== null) {
            imgClass += selected === i ? " selected" : " inactive";
          } else if (hovered === i) {
            imgClass += " hovered";
          }

          return (
            <img
              key={i}
              src={img}
              alt={labels[i]}
              className={imgClass}
              onMouseEnter={() => {
                if (selected === null) setHovered(i);
              }}
              onMouseLeave={() => {
                if (selected === null) setHovered(null);
              }}
              onClick={() => {
                if (selected === null) setSelected(i);
                else if (selected === i) {
                  setSelected(null);
                  setHovered(null);
                  setReminderType(null);
                  setShowCalendar(false);
                  setSelectedDateTime(null);
                }
              }}
            />
          );
        })}
      </div>

      {selected !== null && (
        <>
          {/* Knapprad */}
          <div className="reminder-radio-row d-flex gap-3 mt-4">
            <button
              type="button"
              className="btn btn-primary reminder-btn"
              onClick={() => handleClick("single")}
            >
              Enstaka påminnelser
            </button>

            <button
              type="button"
              className="btn btn-primary reminder-btn"
              onClick={() => handleClick("recurring")}
            >
              Återkommande påminnelser
            </button>
          </div>

          <div style={{ marginTop: "2rem" }}>
            <DatePicker
              selected={selectedDateTime}
              onChange={(date) => setSelectedDateTime(date)}
              showTimeSelect
              timeIntervals={5} // ändra till 1 för minutprecision
              timeFormat="HH:mm"
              dateFormat="Pp"
              inline
            />
          </div>
        </>
      )}
    </div>
  );
}

export default Reminders;
