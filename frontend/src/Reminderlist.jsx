import React, { useState, useEffect, useRef } from "react";
// import reminderData from "./reminder-data.json"; // Kommenterad mock-data
import "./ReminderList.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useAuth } from "./contexts/AuthContext";
import { useLocation } from "react-router-dom";

// Removed old login function - now using AuthContext

const ReminderList = () => {
  const { user, getAuthHeaders } = useAuth();
  const location = useLocation();
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

  // Hämtar påminnelser från backend - only when user changes (login/logout)
  const fetchReminders = async () => {
    if (!user) {
      setData([]); // Clear data when user logs out
      return;
    }
    
    try {
      const response = await fetch(`/api/users/${user.id}/reminders`, {
        headers: getAuthHeaders(),
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

  // Refresh when user changes OR when navigating to this page
  useEffect(() => {
    if (user) {
      fetchReminders();
    }
  }, [user?.id, location.pathname]); // Run when user ID changes OR when pathname changes

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
  const handleDeleteOnce = async (id) => {
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
      try {
        const response = await fetch(`/api/users/${user.id}/reminders/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });

        if (response.ok) {
          // Only update frontend state after successful API call
          setData((prev) => prev.filter((r) => r.id !== id));
          alert('Påminnelse har tagits bort!');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error('Error deleting reminder:', error);
        alert('Ett fel uppstod när påminnelsen skulle tas bort.');
      }
    }
  };

  const handleDeleteRecurring = async (id) => {
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
      try {
        const response = await fetch(`/api/users/${user.id}/reminders/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });

        if (response.ok) {
          // Only update frontend state after successful API call
          setData((prev) => prev.filter((r) => r.id !== id));
          alert('Påminnelse har tagits bort!');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error('Error deleting reminder:', error);
        alert('Ett fel uppstod när påminnelsen skulle tas bort.');
      }
    }
  };

  const handleEditSubmit = async (e, id) => {
    e.preventDefault();
    const form = e.target;
    const updatedReminder = {
      id,
      type: "once",
      category: currentReminder.category,
      dateTime: `${form.date.value}T${form.time.value}:00+02:00`, // Add timezone info for OffsetDateTime
      note: form.note.value,
    };


    try {
      const response = await fetch(`/api/users/${user.id}/reminders/${id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedReminder)
      });

      console.log('Edit response status:', response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log('Edit response data:', responseData);
        // Only update frontend state after successful API call
        setData((prev) => prev.map((r) => (r.id === id ? updatedReminder : r)));
        setEditingId(null);
        alert('Påminnelse har uppdaterats!');
      } else {
        const errorText = await response.text();
        console.error('Edit failed:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating reminder:', error);
      alert('Ett fel uppstod när påminnelsen skulle uppdateras.');
    }
  };

  const handleRecurringSubmit = async (e, id) => {
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

    try {
      const response = await fetch(`/api/users/${user.id}/reminders/${id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedReminder)
      });

      if (response.ok) {
        // Only update frontend state after successful API call
        setData((prev) => prev.map((r) => (r.id === id ? updatedReminder : r)));
        setEditingId(null);
        alert('Påminnelse har uppdaterats!');
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating reminder:', error);
      alert('Ett fel uppstod när påminnelsen skulle uppdateras.');
    }
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
                <FaEdit 
                  onClick={() => setEditingId(rem.id)} 
                  title="Redigera påminnelse"
                  aria-label="Redigera påminnelse"
                  role="button"
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                />
                <FaTrash 
                  onClick={() => handleDeleteOnce(rem.id)} 
                  title="Ta bort påminnelse"
                  aria-label="Ta bort påminnelse"
                  role="button"
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                />
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
                <FaEdit 
                  onClick={() => setEditingId(rem.id)} 
                  title="Redigera påminnelse"
                  aria-label="Redigera påminnelse"
                  role="button"
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                />
                <FaTrash 
                  onClick={() => handleDeleteRecurring(rem.id)} 
                  title="Ta bort påminnelse"
                  aria-label="Ta bort påminnelse"
                  role="button"
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                />
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
