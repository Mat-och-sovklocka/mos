import React, { useState, useEffect, useRef } from "react";
import reminderData from "./reminder-data.json";
import "./ReminderList.css";
import { FaEdit, FaTrash } from "react-icons/fa";

const ReminderList = () => {
  const [data, setData] = useState(reminderData);
  const [expandedNoteId, setExpandedNoteId] = useState(null);
  const cardRefs = useRef([]);
  const [editingId, setEditingId] = useState(null);
  

  const categoryClassMap = {
    Måltid: "meal-card",
    Medicin: "medication-card",
    Träning: "exercise-card",
    Sömn: "sleep-card",
    Städning: "cleaning-card",
    Dusch: "shower-card",
    Möte: "meeting-card",
  };

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

  const onceReminders = data.filter((r) => r.type === "once");
  const recurringReminders = data.filter((r) => r.type === "recurring");

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString("sv-SE");

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

            {editingId === reminder.id && (
              <div className="edit-form-container">
                <form onSubmit={(e) => handleEditSubmit(e, reminder.id)}>
                  <input
                    type="text"
                    name="note"
                    defaultValue={reminder.note}
                    placeholder="Redigera notering"
                  />
                  {/* Lägg till fler fält vid behov */}
                  <button type="submit">Spara</button>
                  <button type="button" onClick={() => setEditingId(null)}>
                    Avbryt
                  </button>
                </form>
              </div>
            )}
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

            {editingId === reminder.id && (
              <div className="edit-form-container">
                <form onSubmit={(e) => handleEditSubmit(e, reminder.id)}>
                  <div className="day-selector">
                    {allDays.map((day) => (
                      <button
                        key={day}
                        type="button"
                        className={
                          selectedDays.includes(day)
                            ? "day-button selected"
                            : "day-button"
                        }
                        onClick={() => toggleDay(day)}
                      >
                        {day}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    name="note"
                    defaultValue={reminder.note}
                    placeholder="Redigera notering"
                  />
                  {/* Lägg till fler fält vid behov */}
                  <button type="submit">Spara</button>
                  <button type="button" onClick={() => setEditingId(null)}>
                    Avbryt
                  </button>
                </form>
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
};

export default ReminderList;
