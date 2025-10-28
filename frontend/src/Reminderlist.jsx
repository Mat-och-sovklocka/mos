import React, { useState, useEffect, useRef } from "react";
import "./ReminderList.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useAuth } from "./contexts/AuthContext";
import { useLocation, useNavigate, Link } from "react-router-dom";
import homeIcon from "./images/home.png";

// Removed old login function - now using AuthContext

const ReminderList = () => {
  const { user, getAuthHeaders, logout } = useAuth();
  const isAdminOrCaregiver = user?.userType === 'ADMIN' || user?.userType === 'CAREGIVER';
  const location = useLocation();
  const navigate = useNavigate();
  const viewedPatientName = location?.state?.viewedPatientName || null;
  const viewedPatientId = location?.state?.viewedPatientId || null;
  const [data, setData] = useState([]);
  const [expandedNoteId, setExpandedNoteId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [modal, setModal] = useState({ show: false, type: '', message: '', onConfirm: null });
  const cardRefs = useRef([]);

  // Prevent background scrolling when an edit modal is open
  useEffect(() => {
    if (editingId !== null) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    // cleanup on unmount
    return () => document.body.classList.remove('modal-open');
  }, [editingId]);

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

  // Helper function to extract custom category text and remaining note
  const extractCustomText = (note, category) => {
    if (category !== 'OTHER' || !note) {
      return { customText: null, remainingNote: note };
    }
    
    // Check if note starts with *customText* format
    const match = note.match(/^\*([^*]+)\*(.*)$/);
    if (match) {
      return {
        customText: match[1],
        remainingNote: match[2] || null
      };
    }
    
    return { customText: null, remainingNote: note };
  };

  // Helper function to get category display text
  const getCategoryDisplay = (reminder) => {
    const { customText } = extractCustomText(reminder.note, reminder.category);
    if (customText) {
      return customText;
    }
    return categoryToLabel[reminder.category] || reminder.category;
  };

  // Helper function to get note display text
  const getNoteDisplay = (reminder) => {
    const { remainingNote } = extractCustomText(reminder.note, reminder.category);
    return remainingNote;
  };

  // Sanitize text to remove newlines and collapse multiple spaces
  const sanitizeText = (s) => {
    if (!s && s !== "") return s;
    return String(s).replace(/\s+/g, " ").trim();
  };

  // Helper function to normalize day names to long format for display
  const normalizeDaysForDisplay = (days) => {
    const shortToFull = {
      Mån: "Måndag",
      Tis: "Tisdag", 
      Ons: "Onsdag",
      Tor: "Torsdag",
      Fre: "Fredag",
      Lör: "Lördag",
      Sön: "Söndag",
    };
    
    return days.map(day => {
      // Om det är kort namn, konvertera till långt
      if (shortToFull[day]) {
        return shortToFull[day];
      }
      // Om det redan är långt namn, behåll det
      return day;
    });
  };

  // Modal helper functions
  const showModal = (type, message, onConfirm = null) => {
    setModal({ show: true, type, message, onConfirm });
  };

  const hideModal = () => {
    setModal({ show: false, type: '', message: '', onConfirm: null });
  };

  const handleModalConfirm = () => {
    if (modal.onConfirm) {
      modal.onConfirm();
    }
    hideModal();
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

    console.log("Original days from reminder:", daysArray);

    // Hantera både korta och långa dagnamn
    const mappedDays = daysArray.map((day) => {
      // Om det redan är ett kort namn, använd det direkt
      if (["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"].includes(day)) {
        return day;
      }
      // Annars mappa från långt till kort namn
      return fullToShort[day];
    }).filter(Boolean);

    console.log("Mapped days for selection:", mappedDays);
    setSelectedDays(mappedDays);

    setSelectedTimes(currentReminder.times || []);
  }, [editingId]);

  // Synka höjder på kort
  // Previously we equalized card heights which caused clipping on large screens.
  // Remove that behavior so each card sizes to its content naturally.

  // Hämtar påminnelser från backend - only when user changes (login/logout)
  const fetchReminders = async () => {
    if (!user) {
      setData([]); // Clear data when user logs out
      return;
    }
    
    try {
      // Use viewedPatientId when caregiver is viewing patient, otherwise use current user's ID
      const targetUserId = viewedPatientId || user.id;
      const response = await fetch(`/api/users/${targetUserId}/reminders`, {
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

  // Refresh when user changes OR when navigating to this page OR when viewedPatientId changes
  useEffect(() => {
    if (user) {
      fetchReminders();
    }
  }, [user?.id, viewedPatientId, location.pathname]); // Run when user ID changes OR when viewedPatientId changes OR when pathname changes

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
    const confirmMessage = `Ta bort enstaka påminnelse?\n\nKategori: ${
      getCategoryDisplay(rem)
    }\nDatum: ${formatDate(rem.dateTime)}\nTid: ${formatTime(
      rem.dateTime
    )}\n${getNoteDisplay(rem) || ""}`;

    const performDelete = async () => {
      try {
        const targetUserId = viewedPatientId || user.id;
        const response = await fetch(`/api/users/${targetUserId}/reminders/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });

        if (response.ok) {
          // Only update frontend state after successful API call
          setData((prev) => prev.filter((r) => r.id !== id));
          showModal('success', 'Påminnelse har tagits bort!');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error('Error deleting reminder:', error);
        showModal('error', 'Ett fel uppstod när påminnelsen skulle tas bort.');
      }
    };

    showModal('confirm', confirmMessage, performDelete);
  };

  const handleDeleteRecurring = async (id) => {
    const rem = data.find((r) => r.id === id);
    const confirmMessage = `Ta bort återkommande påminnelse?\n\nKategori: ${
      getCategoryDisplay(rem)
    }\nDagar: ${normalizeDaysForDisplay(rem.days).join(", ")}\nTider: ${rem.times.join(", ")}\n${
      getNoteDisplay(rem) || ""
    }`;

    const performDelete = async () => {
      try {
        const targetUserId = viewedPatientId || user.id;
        const response = await fetch(`/api/users/${targetUserId}/reminders/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });

        if (response.ok) {
          // Only update frontend state after successful API call
          setData((prev) => prev.filter((r) => r.id !== id));
          showModal('success', 'Påminnelse har tagits bort!');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error('Error deleting reminder:', error);
        showModal('error', 'Ett fel uppstod när påminnelsen skulle tas bort.');
      }
    };

    showModal('confirm', confirmMessage, performDelete);
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
      const targetUserId = viewedPatientId || user.id;
      const response = await fetch(`/api/users/${targetUserId}/reminders/${id}`, {
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
        showModal('success', 'Påminnelse har uppdaterats!');
      } else {
        const errorText = await response.text();
        console.error('Edit failed:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating reminder:', error);
      showModal('error', 'Ett fel uppstod när påminnelsen skulle uppdateras.');
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
      const targetUserId = viewedPatientId || user.id;
      const response = await fetch(`/api/users/${targetUserId}/reminders/${id}`, {
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
        showModal('success', 'Påminnelse har uppdaterats!');
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating reminder:', error);
      showModal('error', 'Ett fel uppstod när påminnelsen skulle uppdateras.');
    }
  };

  return (
    <div className="reminder-page">
      {/* Top header bar with user info and logout */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '20px', 
        padding: '12px 0',
        borderBottom: '1px solid #e0e0e0'
      }}>
        {/* User info and patient info */}
        <div style={{ 
          backgroundColor: 'rgba(255,255,255,0.95)', 
          padding: '12px 16px', 
          borderRadius: '8px', 
          fontSize: '14px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)', 
          border: '1px solid #e0e0e0',
          maxWidth: '70%'
        }}>
          <div>
            <span className="text-muted">Inloggad som: </span>
            <strong style={{ color: '#316e70' }}>{user?.displayName || user?.email}</strong>
            <span className="badge bg-primary ms-2" style={{ fontSize: '11px' }}>{user?.userType}</span>
          </div>
          {viewedPatientName && (
            <div style={{ marginTop: '8px', padding: '6px 8px', backgroundColor: '#e8f4f8', borderRadius: '4px', border: '1px solid #316e70' }}>
              <strong style={{ color: '#316e70', fontSize: '14px' }}>👤 Patient: {viewedPatientName}</strong>
            </div>
          )}
        </div>

        {/* Logout button */}
        {isAdminOrCaregiver && (
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="btn btn-outline-danger btn-sm"
            style={{ marginTop: '4px' }}
          >
            Logout
          </button>
        )}
      </div>

      <h1 className="reminder-title">Påminnelselista</h1>

      {/* Patient context banner */}
      {viewedPatientName && (
        <div style={{ 
          textAlign: 'center', 
          margin: '0 auto 40px auto', 
          padding: '12px 24px', 
          backgroundColor: '#e8f4f8', 
          border: '2px solid #316e70', 
          borderRadius: '8px', 
          maxWidth: '600px',
          fontSize: '16px',
          fontWeight: '600',
          color: '#316e70'
        }}>
          📝 Du tittar på påminnelser för: <strong>{viewedPatientName}</strong>
        </div>
      )}

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
              <h3>{getCategoryDisplay(rem)}</h3>
            </div>
            <div className="reminder-body">
              <div className="reminder-info">
                <p>
                  <strong>Datum:</strong> <span className="nowrap">{formatDate(rem.dateTime)}</span>
                </p>
                <p>
                  <strong>Tid:</strong> <span className="nowrap">{formatTime(rem.dateTime)}</span>
                </p>
                {getNoteDisplay(rem) && (
                  <p>
                    <strong>Notering:</strong>{" "}
                    {expandedNoteId === rem.id || getNoteDisplay(rem).length < 80
                      ? sanitizeText(getNoteDisplay(rem))
                      : sanitizeText(getNoteDisplay(rem).slice(0, 80)) + "... "}
                    {getNoteDisplay(rem).length >= 80 && (
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
              <h3>{getCategoryDisplay(rem)}</h3>
            </div>
            <div className="reminder-body">
              <div className="reminder-info">
                <p>
                  <strong>Dagar:</strong> {normalizeDaysForDisplay(rem.days).join(", ")}
                </p>
                <p>
                  <strong>Tider:</strong> {rem.times.join(", ")}
                </p>
                {getNoteDisplay(rem) && (
                  <p>
                    <strong>Notering:</strong> {getNoteDisplay(rem)}
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
                  defaultValue={getNoteDisplay(currentReminder)}
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
                  defaultValue={getNoteDisplay(currentReminder)}
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

      <div className="row mt-5">
        <div className="col-12 d-flex justify-content-center">
          {isAdminOrCaregiver && !viewedPatientName ? (
            <img src={homeIcon} alt="Hem (otillgänglig)" className="disabled-home" title="Inte tillgänglig för administratörer eller vårdgivare" aria-label="Hem (otillgänglig för administratörer eller vårdgivare)" style={{ width: "80px" }} />
          ) : (
            <Link to="/" state={location.state}>
              <img
                src={homeIcon}
                alt="Tillbaka till startsidan"
                style={{ width: "80px", cursor: "pointer" }}
              />
            </Link>
          )}
        </div>
      </div>

      {/* Modal */}
      {modal.show && (
        <>
          <div className="modal-overlay" onClick={modal.type !== 'confirm' ? hideModal : undefined} />
          <div className="modal-container">
            <div className="modal-content">
              <div className="modal-header">
                {modal.type === 'confirm' && (
                  <h3>Bekräfta</h3>
                )}
                {modal.type === 'success' && (
                  <h3 style={{ color: '#28a745' }}>✓ Klart!</h3>
                )}
                {modal.type === 'error' && (
                  <h3 style={{ color: '#dc3545' }}>⚠ Fel</h3>
                )}
              </div>
              
              <div className="modal-body">
                <p style={{ 
                  whiteSpace: 'pre-line', 
                  lineHeight: '1.5',
                  margin: '0 0 20px 0'
                }}>
                  {modal.message}
                </p>
              </div>

              <div className="modal-footer">
                {modal.type === 'confirm' ? (
                  <>
                    <button 
                      type="button" 
                      className="modal-btn modal-btn-secondary"
                      onClick={hideModal}
                    >
                      Avbryt
                    </button>
                    <button 
                      type="button" 
                      className="modal-btn modal-btn-danger"
                      onClick={handleModalConfirm}
                    >
                      Ta bort
                    </button>
                  </>
                ) : (
                  <button 
                    type="button" 
                    className="modal-btn modal-btn-primary"
                    onClick={hideModal}
                  >
                    OK
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReminderList;
