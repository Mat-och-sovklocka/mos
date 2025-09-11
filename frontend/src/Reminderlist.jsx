import React, { useState, useEffect, useRef } from "react";
import reminderData from "./reminder-data.json";
import "./ReminderList.css";
import { FaEdit, FaTrash } from "react-icons/fa";

const ReminderList = () => {
  const [data, setData] = useState(reminderData);
  const [expandedNoteId, setExpandedNoteId] = useState(null);
  const cardRefs = useRef([]);
  const [editingId, setEditingId] = useState(null);
  const onceReminders = data.filter((r) => r.type === "once");
  const recurringReminders = data.filter((r) => r.type === "recurring");
  const currentReminder = data.find((r) => r.id === editingId);

  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const days = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];

  const categoryClassMap = {
    Måltid: "meal-card",
    Medicin: "medication-card",
    Träning: "exercise-card",
    Sömn: "sleep-card",
    Städning: "cleaning-card",
    Dusch: "shower-card",
    Möte: "meeting-card",
  };
  useEffect(() => {
    const rem = data.find((r) => r.id === editingId);
    if (rem?.type === "recurring") {
      const fullToShort = {
        Måndag: "Mån",
        Tisdag: "Tis",
        Onsdag: "Ons",
        Torsdag: "Tor",
        Fredag: "Fre",
        Lördag: "Lör",
        Söndag: "Sön",
      };
      const mapped = (rem.days || [])
        .map((full) => fullToShort[full])
        .filter(Boolean);
      setSelectedDays(mapped);
      setSelectedTimes(rem.times || []);
    } else {
      setSelectedDays([]);
      setSelectedTimes([]);
    }
  }, [editingId]);

  const heights = cardRefs.current.map((ref) => ref?.offsetHeight || 0);
  const maxHeight = Math.max(...heights);
  cardRefs.current.forEach((ref) => {
    if (ref) ref.style.height = `${maxHeight}px`;
  });

  const isMobile = window.innerWidth < 600;

  if (!isMobile) {
    const heights = cardRefs.current.map((ref) => ref?.offsetHeight || 0);
    const maxHeight = Math.max(...heights);
    cardRefs.current.forEach((ref) => {
      if (ref) ref.style.height = `${maxHeight}px`;
    });
  } else {
    // Återställ höjd på mobil
    cardRefs.current.forEach((ref) => {
      if (ref) ref.style.height = "auto";
    });
  }

  const updateTime = (index, newTime) => {
    setSelectedTimes((prev) => {
      const updated = [...prev];
      updated[index] = newTime;
      return updated;
    });
  };

  const removeTime = (index) => {
    setSelectedTimes((prev) => prev.filter((_, i) => i !== index));
  };

  const addTime = () => {
    setSelectedTimes((prev) => [...prev, ""]);
  };

  const getCategoryClass = (category) => categoryClassMap[category] || "";

  // Dynamisk höjdsynkning
  useEffect(() => {
    if (cardRefs.current.length === 0) return;

    const heights = cardRefs.current.map((ref) => ref?.offsetHeight || 0);
    const maxHeight = Math.max(...heights);

    cardRefs.current.forEach((ref) => {
      if (ref) ref.style.height = `${maxHeight}px`;
    });
  }, [data]);

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString("sv-SE");

  const toggleDay = (day) => {
    setSelectedDays(
      (prev) =>
        prev.includes(day)
          ? prev.filter((d) => d !== day) // avmarkera
          : [...prev, day] // markera ny
    );
  };

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString("sv-SE", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const toggleNote = (id) => {
    setExpandedNoteId(expandedNoteId === id ? null : id);
  };

  const handleDeleteClick = (reminder) => {
    const confirmText = `
Vill du ta bort denna påminnelse?

Kategori: ${reminder.category}
${
  reminder.type === "once"
    ? `Datum: ${formatDate(reminder.dateTime)}\nTid: ${formatTime(
        reminder.dateTime
      )}`
    : `Dagar: ${reminder.days?.join(", ")}\nTider: ${reminder.times?.join(
        ", "
      )}`
}
${reminder.note ? `Notering: ${reminder.note}` : ""}
`;

    if (window.confirm(confirmText)) {
      const updatedData = data.filter((r) => r.id !== reminder.id);
      setData(updatedData);

      console.log("Skickar till backend:", {
        deletedReminderId: reminder.id,
        updatedReminders: updatedData,
      });
    }
  };

  const handleEditSubmit = (e, id) => {
    e.preventDefault();
    const form = e.target;

    const updatedReminder = {
      id,
      dateTime: `${form.date.value}T${form.time.value}`,
      note: form.note.value,
      category: onceReminders.find((r) => r.id === id)?.category || "Okänd",
    };

    const updatedReminders = onceReminders.map((r) =>
      r.id === id ? updatedReminder : r
    );

    setOnceReminders(updatedReminders);
    setEditingId(null);
  };

  return (
    <div className="reminder-page">
      <h1 className="reminder-title">Påminnelselista</h1>

      <section className="reminder-section">
        <h2>Enstaka påminnelser</h2>
        {onceReminders.map((reminder, index) => (
          <div
            key={reminder.id}
            ref={(el) => (cardRefs.current[index] = el)}
            className={`reminder-card ${getCategoryClass(reminder.category)}`}
          >
            {/* Rad 1: Rubrik */}
            <div className="reminder-header">
              <h3>{reminder.category}</h3>
            </div>

            {/* Rad 2: Info + Ikoner */}
            <div className="reminder-body">
              <div className="reminder-info">
                <p>
                  <strong>Datum:</strong> {formatDate(reminder.dateTime)}
                </p>
                <p>
                  <strong>Tid:</strong> {formatTime(reminder.dateTime)}
                </p>
                {reminder.note && (
                  <p>
                    <strong>Notering:</strong>{" "}
                    {expandedNoteId === reminder.id || reminder.note.length < 80
                      ? reminder.note
                      : `${reminder.note.slice(0, 80)}... `}
                    {reminder.note.length >= 80 && (
                      <span
                        className="toggle-note"
                        onClick={() => toggleNote(reminder.id)}
                      >
                        {expandedNoteId === reminder.id
                          ? "Visa mindre"
                          : "Visa mer"}
                      </span>
                    )}
                  </p>
                )}
              </div>
              <div className="reminder-actions">
                <FaEdit onClick={() => setEditingId(reminder.id)} />
                <FaTrash onClick={() => handleDeleteClick(reminder)} />
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="reminder-section">
        <h2>Återkommande påminnelser</h2>
        {recurringReminders.map((reminder, index) => (
          <div
            key={reminder.id}
            ref={(el) => (cardRefs.current[onceReminders.length + index] = el)}
            className={`reminder-card ${getCategoryClass(reminder.category)}`}
          >
            {/* Rad 1: Rubrik */}
            <div className="reminder-header">
              <h3>{reminder.category}</h3>
            </div>

            {/* Rad 2: Info + Ikoner */}
            <div className="reminder-body">
              <div className="reminder-info">
                <p>
                  <strong>Dagar:</strong> {reminder.days?.join(", ") || "–"}
                </p>
                <p>
                  <strong>Tider:</strong> {reminder.times?.join(", ") || "–"}
                </p>
                {reminder.note && (
                  <p>
                    <strong>Notering:</strong>{" "}
                    {expandedNoteId === reminder.id || reminder.note.length < 80
                      ? reminder.note
                      : `${reminder.note.slice(0, 80)}... `}
                    {reminder.note.length >= 80 && (
                      <span
                        className="toggle-note"
                        onClick={() => toggleNote(reminder.id)}
                      >
                        {expandedNoteId === reminder.id
                          ? "Visa mindre"
                          : "Visa mer"}
                      </span>
                    )}
                  </p>
                )}
              </div>
              <div className="reminder-actions">
                <FaEdit onClick={() => setEditingId(reminder.id)} />
                <FaTrash onClick={() => handleDeleteClick(reminder)} />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* 🔒 Global overlay + formulär */}
      {currentReminder?.type === "once" && (
        <>
          <div className="form-overlay" onClick={() => setEditingId(null)} />
          <div className="edit-form-container fixed-form">
            <form onSubmit={(e) => handleEditSubmit(e, editingId)}>
              {/* Datum och Tid */}
              <div className="form-row two-columns">
                <div className="form-group">
                  <label htmlFor="date">Datum:</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    defaultValue={currentReminder.dateTime.slice(0, 10)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="time">Tid:</label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    defaultValue={currentReminder.dateTime.slice(11, 16)}
                    required
                  />
                </div>
              </div>

              {/* Notering */}
              <div className="form-row">
                <label htmlFor="note">Notering:</label>
                <input
                  type="text"
                  id="note"
                  name="note"
                  defaultValue={currentReminder.note}
                  placeholder="Redigera notering"
                />
              </div>

              {/* Knappar */}
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

      {currentReminder?.type === "recurring" && (
        <>
          <div className="form-overlay" onClick={() => setEditingId(null)} />
          <div className="edit-form-container fixed-form">
            <form onSubmit={(e) => handleRecurringSubmit(e, editingId)}>
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
                      {selectedDays.includes(day) ? "✓ " : ""}
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tider */}
              <div className="time-list">
                {selectedTimes.map((time, index) => (
                  <div key={index} className="time-entry">
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => updateTime(index, e.target.value)}
                    />
                    <div className="icon-wrapper">
                      <button
                        type="button"
                        onClick={() => removeTime(index)}
                        title="Ta bort tid"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button type="button" onClick={addTime}>
                + Lägg till tid
              </button>

              {/* Notering */}
              <div className="form-row">
                <label htmlFor="note">Notering:</label>
                <input
                  type="text"
                  id="note"
                  name="note"
                  defaultValue={currentReminder.note}
                  placeholder="Redigera notering"
                />
              </div>

              {/* Knappar */}
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
