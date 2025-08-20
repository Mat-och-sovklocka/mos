// ⬇️ IMPORTER
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

// ⬇️ DATA
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
  // ⬇️ STATE
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const [reminderType, setReminderType] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [timeSelected, setTimeSelected] = useState(false);

  const activeIndex = selected !== null ? selected : hovered;
  const activeLabel = activeIndex !== null ? labels[activeIndex] : "";

  // ⬇️ TRIGGAS NÄR TID VÄLJS
  const handleTimeSelect = (date) => {
    setSelectedDateTime(date);
    setTimeSelected(true);
  };

  // ⬇️ SIMULERAD BACKEND-FÖRFRÅGAN
  const sendReminder = () => {
    // 🔶 HÄR ÄR DATAN SOM SKULLE SKICKAS TILL BACKEND
    const payload = {
      type: activeLabel, // t.ex. "Måltider"
      date: formatDate(selectedDateTime), // t.ex. "20 augusti 2025"
      time: formatTime(selectedDateTime), // t.ex. "14:30"
    };

    // 🔶 HÄR SKULLE DU ANVÄNDA fetch() ELLER axios.post() FÖR ATT SKICKA TILL BACKEND
    console.log("Skickar till backend...", payload);

    // 🔶 SIMULERAD FÖRDRÖJNING OCH BEKRÄFTELSE
    setTimeout(() => {
      alert(`Påminnelse skickad:\n${payload.type} - ${payload.date} kl. ${payload.time}`);
      // 🔶 ÅTERSTÄLL STATE EFTER "SKICK"
      setSelectedDateTime(null);
      setTimeSelected(false);
      setSelected(null);
      setHovered(null);
      setReminderType(null);
      setShowCalendar(false);
    }, 1000);
  };

  const handleClick = (type) => {
    setReminderType(type);
    if (type === "single") {
      setShowCalendar(true);
    } else {
      setShowCalendar(false);
      setSelectedDateTime(null);
      setTimeSelected(false);
    }
  };

  const formatDate = (date) =>
    date?.toLocaleDateString("sv-SE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatTime = (date) =>
    date?.toLocaleTimeString("sv-SE", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="reminders-container container">
      <h1 className="h1 text-primary fw-bold text-center mb-4">Påminnelser</h1>

      <p className="lead text-muted text-center mb-5">
        För musmarkören över bilden för att se de olika typer av påminnelser. <br />
        Klicka sedan på den påminnelse du vill ställa.
      </p>

      <div
        className="reminder-textfield border border-primary rounded bg-white mx-auto p-3 fw-bold text-primary text-center mb-4 fs-4"
        style={{ minHeight: "3rem", maxWidth: "800px" }}
      >
        {activeLabel ? activeLabel : <span style={{ visibility: "hidden" }}>placeholder</span>}
      </div>

      {/* Bilder */}
      <div className="row">
        <div className="col-8 mx-auto">
          <div className="row mb-4">
            {images.map((img, i) => (
              <div key={i} className="col-3 d-flex justify-content-center">
                <img
                  src={img}
                  alt={labels[i]}
                  className={`reminder-img ${
                    selected !== null
                      ? selected === i
                        ? "selected"
                        : "inactive"
                      : hovered === i
                      ? "hovered"
                      : ""
                  }`}
                  onMouseEnter={() => selected === null && setHovered(i)}
                  onMouseLeave={() => selected === null && setHovered(null)}
                  onClick={() => {
                    if (selected === null) setSelected(i);
                    else if (selected === i) {
                      setSelected(null);
                      setHovered(null);
                      setReminderType(null);
                      setShowCalendar(false);
                      setSelectedDateTime(null);
                      setTimeSelected(false);
                    }
                  }}
                />
              </div>
            ))}
          </div>

          {/* Knappar */}
          {selected !== null && (
            <div className="row mb-4">
              <div className="col-6">
                <button
                  className="btn btn-primary w-100 fw-bold text-uppercase"
                  onClick={() => handleClick("single")}
                >
                  Enstaka påminnelser
                </button>
              </div>
              <div className="col-6">
                <button
                  className="btn btn-primary w-100 fw-bold text-uppercase"
                  onClick={() => handleClick("recurring")}
                >
                  Återkommande påminnelser
                </button>
              </div>
            </div>
          )}

          {/* Kalender + textfält */}
          {showCalendar && (
            <div className="row">
              <div className="col-md-6">
                <DatePicker
                  selected={selectedDateTime}
                  onChange={(date) => handleTimeSelect(date)}
                  showTimeSelect
                  timeIntervals={5}
                  timeFormat="HH:mm"
                  dateFormat="Pp"
                  inline
                />
              </div>

              {timeSelected && (
                <div className="col-md-6 d-flex flex-column justify-content-start">
                  <div className="border border-success rounded p-3 mb-3 bg-light text-success fw-bold">
                    Vill du lägga en påminnelse för <u>{activeLabel}</u> den{" "}
                    <u>{formatDate(selectedDateTime)}</u> klockan{" "}
                    <u>{formatTime(selectedDateTime)}</u>?
                  </div>

                  <div className="d-flex gap-3">
                    {/* 🔶 HÄR TRIGGAS "SKICKA TILL BACKEND" Tid och datum -Obs komplettera med påminnelsetyp*/}
                    <button className="btn btn-success flex-fill fw-bold" onClick={sendReminder}>
                      OK
                    </button>
                    <button
                      className="btn btn-danger flex-fill fw-bold"
                      onClick={() => {
                        setSelectedDateTime(null);
                        setTimeSelected(false);
                      }}
                    >
                      Avbryt
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reminders;
