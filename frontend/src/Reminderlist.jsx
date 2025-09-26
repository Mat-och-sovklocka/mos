import React, { useState, useEffect, useRef } from "react";
// import reminderData from "./reminder-data.json"; // Kommenterad mock-data
import "./ReminderList.css";
import { FaEdit, FaTrash } from "react-icons/fa";

// Alltid samma admin-login
async function login() {
  try {
    const loginData = {
      email: "resident1@mos.test",
      password: "password123",
    };

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Login failed: ${errorText}`);
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.userId);
    return data.token;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

// Byt till resident-userId
const RESIDENT_USER_ID = "550e8400-e29b-41d4-a716-446655440004";

const ReminderList = () => {
  // const [data, setData] = useState(reminderData); // Kommenterad mock-initiering
  const [data, setData] = useState([]); // Starta med tom array istället
  const [expandedNoteId, setExpandedNoteId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const cardRefs = useRef([]);

  const days = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];
  const categoryClassMap = {
    MEAL: "meal-card",
    MEDICATION: "medication-card",
    EXERCISE: "exercise-card",
    REST: "sleep-card",
    CLEANING: "cleaning-card",
    SHOWER: "shower-card",
    MEETING: "meeting-card",
  };
  const categoryToLabel = {
    MEAL: "Måltider",
    MEDICATION: "Medicinintag",
    EXERCISE: "Rörelse/Pauser",
    REST: "Vila/Sömn",
    MEETING: "Möte",
    SHOWER: "Dusch",
    CLEANING: "Städning",
    OTHER: "Övrigt",
  };

  const onceReminders = data.filter((r) => r.type === "once");
  const recurringReminders = data.filter((r) => r.type === "recurring");
  const currentReminder = data.find((r) => r.id === editingId);

  // 🛠 Central “skicka till backend”-trigger
  useEffect(() => {
    // if (data !== reminderData) {
    //   alert(
    //     "Skickar uppdaterad lista till backend:\n\n" +
    //       JSON.stringify(data, null, 2)
    //   );
    // }
  }, [data]);

  // Mappa fullständiga dag-namn → korta när man öppnar edit för recurring
  useEffect(() => {
    if (!currentReminder || currentReminder.type !== "recurring") {
      setSelectedDays([]);
      setSelectedTimes([]);
      return;
    }

    const fullToShort = {
      Måndag: "Mån",
      Tisdag: "Tis",
      Onsdag: "Ons",
      Torsdag: "Tor",
      Fredag: "Fre",
      Lördag: "Lör",
      Söndag: "Sön",
    };

    // Gör om till array om det är en sträng
    const daysArray = Array.isArray(currentReminder.days)
      ? currentReminder.days
      : currentReminder.days.split(",").map((d) => d.trim());

    setSelectedDays(daysArray.map((full) => fullToShort[full]).filter(Boolean));

    setSelectedTimes(currentReminder.times || []);
  }, [editingId]);

  // Synka höjder på kort
  useEffect(() => {
    if (cardRefs.current.length === 0) return;
    const heights = cardRefs.current.map((r) => r?.offsetHeight || 0);
    const maxHeight = Math.max(...heights);
    cardRefs.current.forEach((r) => {
      if (r) r.style.height = `${maxHeight}px`;
    });
  }, [data, window.innerWidth]);

  // Hämtar påminnelser från backend
  useEffect(() => {
    const fetchReminders = async () => {
      try {
        let token = localStorage.getItem("token");
        let userId = localStorage.getItem("userId");

        if (!token || !userId) {
          token = await login();
          userId = RESIDENT_USER_ID;
          localStorage.setItem("userId", RESIDENT_USER_ID);
        }

        // Tvinga alltid resident-userId
        userId = RESIDENT_USER_ID;
        localStorage.setItem("userId", RESIDENT_USER_ID);

        const response = await fetch(`/api/users/${userId}/reminders`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error: ${errorText}`);
        }

        const reminders = await response.json();
        setData(reminders);
      } catch (error) {
        console.error("Error fetching reminders:", error);
      }
    };

    fetchReminders();
  }, []);

  // Hjälpfunktioner
  const formatDate = (iso) => new Date(iso).toLocaleDateString("sv-SE");
  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString("sv-SE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  const toggleNote = (id) =>
    setExpandedNoteId((prev) => (prev === id ? null : id));
  const toggleDay = (day) =>
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  const updateTime = (idx, val) =>
    setSelectedTimes((prev) => {
      const arr = [...prev];
      arr[idx] = val;
      return arr;
    });
  const removeTime = (idx) =>
    setSelectedTimes((prev) => prev.filter((_, i) => i !== idx));
  const addTime = () => setSelectedTimes((prev) => [...prev, ""]);

  // Handlers
  const handleDeleteOnce = (id) => {
    const rem = data.find((r) => r.id === id);
    if (
      window.confirm(
        `Ta bort enstaka påminnelse?\n\nKategori: ${
          rem.category
        }\nDatum: ${formatDate(rem.dateTime)}\nTid: ${formatTime(
          rem.dateTime
        )}\n${rem.note || ""}`
      )
    ) {
      setData((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleDeleteRecurring = (id) => {
    const rem = data.find((r) => r.id === id);
    if (
      window.confirm(
        `Ta bort återkommande påminnelse?\n\nKategori: ${
          rem.category
        }\nDagar: ${rem.days.join(", ")}\nTider: ${rem.times.join(", ")}\n${
          rem.note || ""
        }`
      )
    ) {
      setData((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleEditSubmit = (e, id) => {
    e.preventDefault();
    const form = e.target;
    const updatedReminder = {
      id,
      type: "once",
      category: currentReminder.category,
      dateTime: `${form.date.value}T${form.time.value}`,
      note: form.note.value,
    };
    setData((prev) => prev.map((r) => (r.id === id ? updatedReminder : r)));
    setEditingId(null);
  };

  const handleRecurringSubmit = (e, id) => {
    e.preventDefault();
    const shortToFull = {
      Mån: "Måndag",
      Tis: "Tisdag",
      Ons: "Onsdag",
      Tor: "Torsdag",
      Fre: "Fredag",
      Lör: "Lördag",
      Sön: "Söndag",
    };
    const updatedReminder = {
      id,
      type: "recurring",
      category: currentReminder.category,
      days: selectedDays.map((s) => shortToFull[s]),
      times: selectedTimes.filter((t) => t),
      note: e.target.note.value,
    };
    setData((prev) => prev.map((r) => (r.id === id ? updatedReminder : r)));
    setEditingId(null);
  };

  return (
    <div className="reminder-page">
      <h1 className="reminder-title">Påminnelselista</h1>

      {/* Enstaka */}
      <section className="reminder-section">
        <h2>Enstaka påminnelser</h2>
        {onceReminders.map((rem, i) => (
          <div
            key={rem.id}
            ref={(el) => (cardRefs.current[i] = el)}
            className={`reminder-card ${categoryClassMap[rem.category]}`}
          >
            <div className="reminder-header">
              <h3>{categoryToLabel[rem.category] || rem.category}</h3>
            </div>
            <div className="reminder-body">
              <div className="reminder-info">
                <p>
                  <strong>Datum:</strong> {formatDate(rem.dateTime)}
                </p>
                <p>
                  <strong>Tid:</strong> {formatTime(rem.dateTime)}
                </p>
                {rem.note && (
                  <p>
                    <strong>Notering:</strong>{" "}
                    {expandedNoteId === rem.id || rem.note.length < 80
                      ? rem.note
                      : rem.note.slice(0, 80) + "... "}
                    {rem.note.length >= 80 && (
                      <span
                        className="toggle-note"
                        onClick={() => toggleNote(rem.id)}
                      >
                        {expandedNoteId === rem.id ? "Visa mindre" : "Visa mer"}
                      </span>
                    )}
                  </p>
                )}
              </div>
              <div className="reminder-actions">
                <FaEdit onClick={() => setEditingId(rem.id)} />
                <FaTrash onClick={() => handleDeleteOnce(rem.id)} />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Återkommande */}
      <section className="reminder-section">
        <h2>Återkommande påminnelser</h2>
        {recurringReminders.map((rem, i) => (
          <div
            key={rem.id}
            ref={(el) => (cardRefs.current[onceReminders.length + i] = el)}
            className={`reminder-card ${categoryClassMap[rem.category]}`}
          >
            <div className="reminder-header">
              <h3>{categoryToLabel[rem.category] || rem.category}</h3>
            </div>
            <div className="reminder-body">
              <div className="reminder-info">
                <p>
                  <strong>Dagar:</strong> {rem.days.join(", ")}
                </p>
                <p>
                  <strong>Tider:</strong> {rem.times.join(", ")}
                </p>
                {rem.note && (
                  <p>
                    <strong>Notering:</strong> {rem.note}
                  </p>
                )}
              </div>
              <div className="reminder-actions">
                <FaEdit onClick={() => setEditingId(rem.id)} />
                <FaTrash onClick={() => handleDeleteRecurring(rem.id)} />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Overlay + formulär för enstaka */}
      {currentReminder?.type === "once" && (
        <>
          <div className="form-overlay" onClick={() => setEditingId(null)} />
          <div className="edit-form-container fixed-form">
            <form onSubmit={(e) => handleEditSubmit(e, currentReminder.id)}>
              {/* Datum + Tid */}
              <div className="form-row two-columns">
                <div className="form-group">
                  <label htmlFor="date">Datum:</label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    defaultValue={currentReminder.dateTime.slice(0, 10)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="time">Tid:</label>
                  <input
                    id="time"
                    name="time"
                    type="time"
                    defaultValue={currentReminder.dateTime.slice(11, 16)}
                    required
                  />
                </div>
              </div>
              {/* Notering */}
              <div className="form-row">
                <label htmlFor="note">Notering:</label>
                <input
                  id="note"
                  name="note"
                  type="text"
                  defaultValue={currentReminder.note}
                  placeholder="Redigera notering"
                />
              </div>
              <div className="button-row">
                <button type="submit">Spara</button>
                <button type="button" onClick={() => setEditingId(null)}>
                  Avbryt
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Overlay + formulär för återkommande */}
      {currentReminder?.type === "recurring" && (
        <>
          <div className="form-overlay" onClick={() => setEditingId(null)} />
          <div className="edit-form-container fixed-form">
            <form
              onSubmit={(e) => handleRecurringSubmit(e, currentReminder.id)}
            >
              {/* Dagar */}
              <div className="form-row">
                <label>Dagar:</label>
                <div className="day-selector">
                  {days.map((day) => (
                    <button
                      key={day}
                      type="button"
                      className={`day-button ${
                        selectedDays.includes(day) ? "selected" : ""
                      }`}
                      onClick={() => toggleDay(day)}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              {/* Tider */}
              <div className="form-row">
                <label>Tider:</label>
                <div className="time-list">
                  {selectedTimes.map((time, idx) => (
                    <div key={idx} className="time-entry">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => updateTime(idx, e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => removeTime(idx)}
                        title="Ta bort tid"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="add-time-button"
                    onClick={addTime}
                  >
                    + Lägg till tid
                  </button>
                </div>
              </div>
              {/* Notering */}
              <div className="form-row">
                <label htmlFor="note">Notering:</label>
                <input
                  id="note"
                  name="note"
                  type="text"
                  defaultValue={currentReminder.note}
                  placeholder="Redigera notering"
                />
              </div>
              <div className="button-row">
                <button type="submit">OK</button>
                <button type="button" onClick={() => setEditingId(null)}>
                  Avbryt
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default ReminderList;
