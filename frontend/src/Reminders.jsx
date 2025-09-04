import React, { useState, useEffect } from "react";
import "./reminder.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import sv from "date-fns/locale/sv";

import img1 from "./images/img1.png";
import img2 from "./images/img2.png";
import img3 from "./images/img3.png";
import img4 from "./images/img4.png";
import img5 from "./images/img5.png";
import img6 from "./images/img6.png";
import img7 from "./images/img7.png";
import img8 from "./images/img8.png";

registerLocale("sv", sv);

function Reminders() {
  const images = [
    { src: img1, alt: "img1" },
    { src: img2, alt: "img2" },
    { src: img3, alt: "img3" },
    { src: img4, alt: "img4" },
    { src: img5, alt: "img5" },
    { src: img6, alt: "img6" },
    { src: img7, alt: "img7" },
    { src: img8, alt: "img8" },
  ];

  const labels = [
    "Måltider",
    "Medicinintag",
    "Rörelse/Pauser",
    "Vila/Sömn",
    "Möte",
    "Dusch",
    "Städning",
    "Övrigt",
  ];

  const [selectedIndex, setSelectedIndex] = useState(null);
  const [reminderType, setReminderType] = useState(null);
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [customReminderText, setCustomReminderText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [reminderNote, setReminderNote] = useState("");

  useEffect(() => {
    setReminderType(null);
    setSelectedDateTime(null);
  }, [selectedIndex]);

  const handleClick = (index) => {
    setSelectedIndex(index === selectedIndex ? null : index);
    setReminderType(null);
    setSelectedDateTime(null);
    setCustomReminderText(""); // Rensa inputfältet om du vill
    setErrorMessage(""); // 🧼 Rensa felmeddelandet
    setReminderNote(""); // 🧼 Rensar noteringen
    setSelectedDateTime(null);
  };

  const handleReminderType = (type) => {
    if (
      labels[selectedIndex] === "Övrigt" &&
      customReminderText.trim() === ""
    ) {
      setErrorMessage("Du måste ange en typ av påminnelse.");
      return;
    }

    setErrorMessage("");
    setReminderType(type);
  };

  const handleConfirmReminder = () => {
    const payload = {
      type: reminderType,
      category:
        labels[selectedIndex] === "Övrigt" && customReminderText
          ? customReminderText
          : labels[selectedIndex],
      dateTime: selectedDateTime.toISOString(),
      note: reminderNote.trim() || null,
    };

    // Här kan du skicka payload till backend om du vill
    // t.ex. axios.post("/api/reminders", payload)
      // Visa payload i en alert för debugging
  alert(JSON.stringify(payload, null, 2));

    // Återställ allt efter bekräftelse
    setSelectedIndex(null);
    setReminderType(null);
    setSelectedDateTime(null);
    setReminderNote("");
    setCustomReminderText("");
    setErrorMessage("");
  };

  const handleCancelReminder = () => {
    setSelectedIndex(null);
    setReminderType(null);
    setCustomReminderText("");
    setReminderNote("");
    setSelectedDateTime(null);
  };

  function renderCustomReminderInput(
    customReminderText,
    setCustomReminderText,
    setErrorMessage
  ) {
    return (
      <div className="custom-reminder-wrapper">
        <label htmlFor="customReminder">Ange typ:</label>
        <input
          type="text"
          id="customReminder"
          name="customReminder"
          placeholder="Skriv din påminnelse..."
          value={customReminderText}
          onChange={(e) => {
            setCustomReminderText(e.target.value);
            if (e.target.value.trim() !== "") {
              setErrorMessage("");
            }
          }}
        />
      </div>
    );
  }

  function resetReminderState() {
    setSelectedIndex(null);
    setReminderType(null);
    setSelectedDateTime(null);
    setReminderNote("");
    setCustomReminderText("");
    setErrorMessage("");
  }

  return (
    <div className="reminders-container">
      <h1 className="reminder-title">Lägg till påminnelser</h1>
      <div className="image-grid">
        <div className="row row-spacing">
          {images.map((image, index) => {
            const isSelected = selectedIndex === index;
            const isDisabled = selectedIndex !== null && !isSelected;

            return (
              <div key={index} className="col-lg-3 col-md-6">
                <div
                  className={`image-wrapper ${isDisabled ? "disabled" : ""}`}
                  onClick={() => handleClick(index)}
                >
                  <img src={image.src} alt={labels[index]} className="image" />
                  <label
                    className={`image-label ${isSelected ? "visible" : ""}`}
                  >
                    {labels[index]}
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        {selectedIndex !== null && (
          <div className="reminder-actions">
            {labels[selectedIndex] === "Övrigt" &&
              renderCustomReminderInput(
                customReminderText,
                setCustomReminderText,
                setErrorMessage
              )}

            {errorMessage && <p className="error-message">{errorMessage}</p>}

            <div className="reminder-buttons-row">
              <button
                className="reminder-button"
                onClick={() => handleReminderType("once")}
              >
                Enstaka påminnelser
              </button>
              <button
                className="reminder-button"
                onClick={() => handleReminderType("recurring")}
              >
                Återkommande påminnelser
              </button>
            </div>
          </div>
        )}

        {reminderType === "once" && (
          <div className="picker-layout">
            <div className="picker-inputs">
              <div className="form-group">
                <label>Välj dag och tid för påminnelsen:</label>
                <DatePicker
                  selected={selectedDateTime}
                  onChange={(date) => setSelectedDateTime(date)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="yyyy-MM-dd HH:mm"
                  placeholderText="Klicka för att välja"
                  locale="sv"
                  minDate={new Date()}
                  withPortal
                />
              </div>

              <div className="form-group">
                <label htmlFor="reminderNote">Notering:</label>
                <textarea
                  id="reminderNote"
                  value={reminderNote}
                  onChange={(e) => setReminderNote(e.target.value)}
                  placeholder="Skriv en notering..."
                  rows={3}
                />
              </div>
            </div>

            {/* Bekräftelse + knappar visas endast om datum är valt */}
            {selectedDateTime && (
              <div className="confirmation-column">
                <label>
                  Vill du lägga en <strong>enstaka</strong> påminnelse
                  <br />
                  för{" "}
                  <strong>
                    {labels[selectedIndex] === "Övrigt" && customReminderText
                      ? customReminderText
                      : labels[selectedIndex]}
                  </strong>{" "}
                  den{" "}
                  <strong>
                    {selectedDateTime.toLocaleString("sv-SE", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </strong>
                  {reminderNote && (
                    <>
                      {" "}
                      med noteringen: "<em>{reminderNote}</em>"
                    </>
                  )}
                </label>

                <div className="confirmation-buttons">
                  <button className="ok-button" onClick={handleConfirmReminder}>
                    OK
                  </button>
                  <button
                    className="cancel-button"
                    onClick={handleCancelReminder}
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
  );
}
export default Reminders;
