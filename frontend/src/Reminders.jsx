import React, { useState, useEffect } from "react";
import "./reminder.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import sv from "date-fns/locale/sv";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

import img1 from "./images/img1.png";
import img2 from "./images/img2.png";
import img3 from "./images/img3.png";
import img4 from "./images/img4.png";
import img5 from "./images/img5.png";
import img6 from "./images/img6.png";
import img7 from "./images/img7.png";
import img8 from "./images/img8.png";
import homeIcon from "./images/home.png";

registerLocale("sv", sv);

function Reminders() {
  const navigate = useNavigate();
  const { user, getAuthHeaders } = useAuth();
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

  const categoryMapping = {
    Måltider: "MEAL",
    Medicinintag: "MEDICATION",
    "Rörelse/Pauser": "EXERCISE",
    "Vila/Sömn": "REST",
    Möte: "MEETING",
    Dusch: "SHOWER",
    Städning: "CLEANING",
    Övrigt: "OTHER",
  };

  const [selectedIndex, setSelectedIndex] = useState(null);
  const [reminderType, setReminderType] = useState(null);
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [customReminderText, setCustomReminderText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [reminderNote, setReminderNote] = useState("");
  const [selectedDays, setSelectedDays] = useState([]);
  const [reminderTimes, setReminderTimes] = useState([""]);
  const [confirmationSummary, setConfirmationSummary] = useState("");
  const [recurringNote, setRecurringNote] = useState("");
  const summaryNote =
    reminderType === "recurring" ? recurringNote : customReminderText;

  useEffect(() => {
    const summary = [];

    if (selectedDays.length > 0) {
      summary.push(`Valda dagar: ${selectedDays.join(", ")}`);
    }

    if (reminderTimes.length > 0 && reminderTimes[0] !== "") {
      summary.push(`Tider: ${reminderTimes.join(", ")}`);
    }

    // Uppdatera noteringen direkt, även om den är tom
    summary.push(`Notering: "${recurringNote}"`);

    setConfirmationSummary(summary.join("\n"));
  }, [selectedDays, reminderTimes, recurringNote]); // Se till att recurringNote är med i dependencies

  useEffect(() => {
    setReminderType(null);
    setSelectedDateTime(null);
  }, [selectedIndex]);

  const resetRecurringForm = () => {
    setSelectedDays([]); // Rensa dagar
    setReminderTimes([""]); // Rensa tider
    // setExtraTimePickers([]); // TA BORT DENNA RAD!
    setCustomReminderText(""); // Rensa notering
    setReminderNote(""); // Om du har separat note-state
    setRecurringNote("");
  };

  // För enstaka påminnelser
  const handleConfirmReminder = async () => {
    if (selectedIndex === null || !labels[selectedIndex]) {
      setErrorMessage("Du måste välja en kategori.");
      return;
    }

    const category =
      labels[selectedIndex] === "Övrigt" && customReminderText
        ? "OTHER"
        : categoryMapping[labels[selectedIndex]];

    // Debug logs removed for production

    const payload = {
      type: "once",
      category,
      dateTime: selectedDateTime.toISOString(),
      days: [],
      times: [],
      note: reminderNote.trim() || null,
    };

    // Debug logs removed for production

    try {
      const targetUserId = getTargetUserId();
      const response = await fetch(`/api/users/${targetUserId}/reminders`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Add this block to see the actual error message from the server
        const errorText = await response.text();
        // Server error details logged
        throw new Error(`Server error: ${errorText}`);
      }

      const data = await response.json();
      // Success response logged
      alert("Påminnelse har skapats!");

      // Reset form after successful creation
      setSelectedIndex(null);
      setReminderType(null);
      setSelectedDateTime(null);
      setReminderNote("");
      setCustomReminderText("");
      setErrorMessage("");
    } catch (error) {
      console.error("Detailed error:", error);
      alert(`Ett fel uppstod: ${error.message}`);
    }
  };

  // Determine target user ID based on user role
  const getTargetUserId = () => {
    // If user is a caregiver, they should create reminders for their assigned residents
    // For now, we'll use a default resident ID, but this should be configurable
    if (user.userType === 'CAREGIVER') {
      return "550e8400-e29b-41d4-a716-446655440004"; // Default resident for caregivers
    }
    // If user is a resident or admin, create reminders for themselves
    return user.id;
  };

  const handleRecurringReminderConfirm = async () => {
    if (selectedIndex === null || !labels[selectedIndex]) {
      setErrorMessage("Du måste välja en kategori.");
      return;
    }

    const category =
      labels[selectedIndex] === "Övrigt" && customReminderText
        ? "OTHER"
        : categoryMapping[labels[selectedIndex]];

    // Debug logs removed for production

    const payload = {
      type: "recurring",
      category,
      dateTime: null,
      days: selectedDays,
      times: reminderTimes.filter((time) => time !== ""),
      note: recurringNote.trim() || null,
    };

    try {
      const targetUserId = getTargetUserId();
      const response = await fetch(`/api/users/${targetUserId}/reminders`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Reminder created successfully
      alert("Påminnelse har skapats!");

      // Återställ formuläret
      setSelectedIndex(null);
      setReminderType(null);
      setCustomReminderText("");
      setErrorMessage("");
      setRecurringNote("");
      setSelectedDays([]);
      setReminderTimes([""]);
      setConfirmationSummary("");
    } catch (error) {
      console.error("Error:", error);
      alert("Ett fel uppstod när påminnelsen skulle skapas.");
    }
  };

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const addReminderTime = () => {
    setReminderTimes((prev) => [...prev, ""]);
  };

  const updateReminderTime = (index, value) => {
    setReminderTimes((prev) =>
      prev.map((time, i) => (i === index ? value : time))
    );
  };

  const removeReminderTime = (index) => {
    setReminderTimes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClick = (index) => {
    setSelectedIndex(index); // Alltid välj det du klickar på
    setReminderType(null);
    setSelectedDateTime(null);
    setCustomReminderText("");
    setErrorMessage("");
    setReminderNote("");
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

  const handleCancelReminder = () => {
    setSelectedIndex(null);
    setReminderType(null);
    setCustomReminderText("");
    setReminderNote("");
    setSelectedDateTime(null);
    setRecurringNote("");
    setSelectedDays([]);
    setReminderTimes([""]);
    setErrorMessage("");
  };

  function läggTillTid() {
    const tidInput = document.getElementById("tid-input");
    const tid = tidInput.value;
    if (tid) {
      const lista = document.getElementById("tider-lista");
      const li = document.createElement("li");
      li.textContent = tid;
      lista.appendChild(li);
      tidInput.value = "";
    }
  }

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

  // Removed old login function - now using AuthContext

  return (
    <div className="reminders-container">
      <h1 className="reminder-title">Lägg till påminnelserna</h1>
      
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
      {reminderType === "recurring" && (
        <div className="reminder-layout">
          <div className="form-column">
            <section className="reminder-form">
              {/* Dagval */}
              <div className="day-selector">
                {["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"].map(
                  (day, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`day-button ${
                        selectedDays.includes(day) ? "active" : ""
                      }`}
                    >
                      {day}
                    </button>
                  )
                )}
              </div>

              {/* Tider – alltid minst en */}
              <div className="time-input-group">
                <label>Tider:</label>
                {(reminderTimes.length > 0 ? reminderTimes : [""]).map(
                  (time, index) => (
                    <div key={index} className="time-row">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) =>
                          updateReminderTime(index, e.target.value)
                        }
                        className="time-input"
                      />
                      {index === 0 ? (
                        <button
                          type="button"
                          onClick={addReminderTime}
                          className="add-time-btn"
                        >
                          ➕
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => removeReminderTime(index)}
                          className="delete-btn"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  )
                )}
              </div>

              {/* Notering */}
              <div className="confirmation-label">
                <label htmlFor="recurring-note">Notering:</label>
                <input
                  type="text"
                  id="recurring-note"
                  name="recurring-note"
                  placeholder="t.ex. Ta medicin"
                  value={recurringNote}
                  onChange={(e) => setRecurringNote(e.target.value)}
                />
              </div>

              {/* Knappar */}
              <div className="form-buttons">
                <button
                  type="button"
                  className="ok-button"
                  disabled={
                    selectedDays.length === 0 ||
                    reminderTimes.length === 0 ||
                    !reminderTimes[0]
                  }
                  onClick={() => {
                    handleRecurringReminderConfirm();
                    resetRecurringForm();
                  }}
                >
                  OK
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCancelReminder}
                >
                  Avbryt
                </button>
              </div>
            </section>
          </div>

          {/* Sammanfattning */}
          <div className="note-column">
            <h3 className="confirmation-title">Sammanfattning</h3>
            <div className="confirmation-summary">
              {confirmationSummary.split("\n").map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="row mt-5">
        <div className="col-12 d-flex justify-content-center">
          <Link to="/">
            <img
              src={homeIcon}
              alt="Tillbaka till startsidan"
              style={{ width: "80px", cursor: "pointer" }}
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
export default Reminders;
