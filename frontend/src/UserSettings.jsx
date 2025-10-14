import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import homeIcon from './images/home.png';

export default function UserSettings() {
  const { user, getAuthHeaders } = useAuth();

  // (Personal settings UI removed) -- admin user management remains below

  // Admin: users list + create
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState(null);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newType, setNewType] = useState('RESIDENT');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createMessage, setCreateMessage] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [assignedPatients, setAssignedPatients] = useState([]);
  const [loadingAssigned, setLoadingAssigned] = useState(false);
  const [assignedError, setAssignedError] = useState(null);
  const [patientPermissions, setPatientPermissions] = useState([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [permissionsError, setPermissionsError] = useState(null);
  // delete state handled per-action

  const mockUsers = [
    { id: 'm-1', displayName: 'Boende Exempel', email: 'boende@example.com', phone: '070-111 22 33', userType: 'RESIDENT' },
    { id: 'm-2', displayName: 'Vårdare Exempel', email: 'vardare@example.com', phone: '070-222 33 44', userType: 'CAREGIVER' },
  ];

  // Map backend userType values to Swedish labels used in selects/details
  const ROLE_LABELS = {
    ADMIN: 'Administratör',
    CAREGIVER: 'Vårdgivare',
    RESIDENT: 'Patient',
  };

  // Inline create form is toggled by `showCreateModal` below.

  function normalizeUser(u) {
    if (!u) return u;
    // server might return `name` or `displayName` — prefer displayName
    return {
      ...u,
      id: u.id || u._id || u.email,
      displayName: u.displayName || u.name || u.display_name || '',
      email: u.email || '',
      phone: u.phone || u.telephone || '',
      userType: u.userType || u.type || u.role || '',
    };
  }

  useEffect(() => {
    if (user?.userType === 'ADMIN') fetchUsers();
    if (user?.userType === 'CAREGIVER') {
      fetchAssignedPatients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // When selected user (patient) changes, fetch that patient's permissions
  useEffect(() => {
    if (user?.userType === 'CAREGIVER' && selectedUser?.id) {
      fetchPatientPermissions(selectedUser.id);
    } else {
      setPatientPermissions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser]);

  async function fetchAssignedPatients() {
    setLoadingAssigned(true);
    setAssignedError(null);
    try {
  // Use documented caretakers endpoint which lists caretakers assigned to the current caregiver
  const res = await fetch('/api/user-management/caretakers', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setAssignedPatients(Array.isArray(data) ? data.map(normalizeUser) : []);
        return;
      }
      // Fallback: use allUsers if available and filter by RESIDENT
      if (allUsers && allUsers.length > 0) {
        setAssignedPatients(allUsers.filter((u) => (u.userType || '').toUpperCase() === 'RESIDENT'));
        return;
      }
      // final fallback: empty list
      setAssignedPatients([]);
    } catch (err) {
      console.warn('Could not fetch assigned patients', err);
      setAssignedError(err.message || String(err));
      setAssignedPatients([]);
    } finally {
      setLoadingAssigned(false);
    }
  }

  // Note: caregiver's own permissions are not editable here; only patient permissions are shown

  // Fetch permissions for a specific patient/caretaker (for caregiver to edit)
  async function fetchPatientPermissions(caretakerId) {
    if (!caretakerId) { setPatientPermissions([]); return; }
    setLoadingPermissions(true);
    setPermissionsError(null);
    try {
      const res = await fetch(`/api/user-management/caretakers/${caretakerId}/permissions`, { headers: getAuthHeaders() });
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      setPatientPermissions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Could not fetch patient permissions', err);
      setPermissionsError(err.message || String(err));
      setPatientPermissions([]);
    } finally {
      setLoadingPermissions(false);
    }
  }

  // change-detection removed: Save is available whenever not saving

  // showCreateModal logging removed (modal removed)

  async function fetchUsers() {
    setLoadingUsers(true);
    setUsersError(null);
    try {
      const res = await fetch('/api/user-management/admin/users', { headers: getAuthHeaders() });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status} ${res.statusText} - ${text}`);
      }
  const data = await res.json();
  setAllUsers(Array.isArray(data) ? data.map(normalizeUser) : []);
    } catch (err) {
      console.warn('Could not fetch users, showing fallback mock users', err);
      setUsersError(err.message || String(err));
      setAllUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }

  // personal save handler removed

  async function handleCreateUser(e) {
    e.preventDefault();
    setCreating(true);
    setCreateMessage(null);
    try {
    const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
  const body = { name: newName, email: newEmail, phone: newPhone, userType: newType, type: newType, role: newType };
  // debug logging removed
    const res = await fetch('/api/user-management/admin/users', { method: 'POST', headers, body: JSON.stringify(body) });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status} ${res.statusText} - ${text}`);
      }
  const created = await res.json();
  const normalizedCreated = normalizeUser(created || {});
  // Add to list optimistically (mark temp if id missing)
  setAllUsers((prev) => [{ ...normalizedCreated, _temp: !normalizedCreated?.id }, ...prev]);
      setCreateMessage({ type: 'success', text: 'Användare skapad.' });
  setNewName('');
  setNewEmail('');
  setNewPhone('');
      setNewType('RESIDENT');
      return true;
    } catch (err) {
      console.error(err);
      setCreateMessage({ type: 'error', text: 'Kunde inte skapa användare: ' + (err.message || err) });
      return false;
    } finally {
      setCreating(false);
    }
  }

  // Save handler for selected user
  async function handleSaveSelectedUser(e) {
    if (e && e.preventDefault) e.preventDefault();
  if (!selectedUser?.id) { setSaveMessage({ type: 'error', text: 'Ingen användare vald.' }); return; }
  setSaving(true);
  setSaveMessage(null);
    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
  const body = { name: selectedUser.displayName, email: selectedUser.email, phone: selectedUser.phone, userType: selectedUser.userType, type: selectedUser.userType, role: selectedUser.userType };
  // debug logging removed
      const res = await fetch(`/api/user-management/admin/users/${selectedUser.id}`, { method: 'PUT', headers, body: JSON.stringify(body) });
      // DEBUG: log response status and body (if any)
      try {
        const clone = res.clone();
  const text = await clone.text();
  // response read silently; no debug logging
      } catch (e) {
  // response status handled silently
      }
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status} ${res.statusText} - ${text}`);
      }
      // Try to read returned user object; some APIs return 204 No Content
      let updated = null;
      try {
        updated = await res.json();
      } catch (err) {
        // ignore JSON parse errors (204 No Content)
      }
      if (updated && (updated.id || updated._id)) {
        const normalized = normalizeUser(updated);
        // update selectedUser and list with server canonical data
        setSelectedUser(normalized);
        setAllUsers((prev) => prev.map((u) => (u.id === normalized.id ? normalized : u)));
        setSaveMessage({ type: 'success', text: 'Sparat.' });
  // originalSelectedUser state removed; nothing to update here
      } else {
        // no body returned — refresh list from server
        setSaveMessage({ type: 'success', text: 'Sparat.' });
        await fetchUsers();
  // originalSelectedUser state removed; nothing to update here
      }
    } catch (err) {
      setSaveMessage({ type: 'error', text: 'Kunde inte spara: ' + (err.message || err) });
  // debug logging removed
    } finally {
      setSaving(false);
    }
  }

  // Save handler for caregiver editing an assigned patient/caretaker
  async function handleSaveCaretaker(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!selectedUser?.id) { setSaveMessage({ type: 'error', text: 'Ingen användare vald.' }); return; }
    setSaving(true);
    setSaveMessage(null);
    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      const body = { name: selectedUser.displayName, email: selectedUser.email, phone: selectedUser.phone };
      const res = await fetch(`/api/user-management/caretakers/${selectedUser.id}`, { method: 'PUT', headers, body: JSON.stringify(body) });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status} ${res.statusText} - ${text}`);
      }
      let updated = null;
      try { updated = await res.json(); } catch (err) { /* ignore parse errors */ }
      if (updated && (updated.id || updated._id)) {
        // refresh list from server to restore canonical state
        await fetchAssignedPatients();
      } else {
        // refresh list from server
        await fetchAssignedPatients();
      }
      // restore UI to initial loaded state
      setSelectedUser(null);
      setSaveMessage(null);
      setCreateMessage(null);
    } catch (err) {
      setSaveMessage({ type: 'error', text: 'Kunde inte spara: ' + (err.message || err) });
    } finally {
      setSaving(false);
    }
  }

  // Create handler for caregiver to add a new patient/caretaker
  async function handleCreateCaretaker(e) {
    e.preventDefault();
    setCreating(true);
    setCreateMessage(null);
    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      const body = { name: newName, email: newEmail, phone: newPhone };
      const res = await fetch('/api/user-management/caretakers', { method: 'POST', headers, body: JSON.stringify(body) });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status} ${res.statusText} - ${text}`);
      }
      const created = await res.json();
      const normalized = normalizeUser(created || {});
      setAssignedPatients((prev) => [{ ...normalized, _temp: !normalized?.id }, ...prev]);
      setCreateMessage({ type: 'success', text: 'Användare skapad.' });
      setNewName(''); setNewEmail(''); setNewPhone(''); setNewType('RESIDENT');
      setShowCreateModal(false);
      return true;
    } catch (err) {
      console.error(err);
      setCreateMessage({ type: 'error', text: 'Kunde inte skapa användare: ' + (err.message || err) });
      return false;
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <h1 className="reminder-title">Användarinställningar</h1>

      {!user && <p className="empty-message">Inloggning krävs för att visa och ändra inställningar.</p>}

      {user && (
        <section className="preference-boxes user-settings-grid" style={{ position: 'relative', paddingBottom: '6rem' }}>
          {/* personal settings card removed */}

          {user.userType === 'ADMIN' ? (
            <>
              <div className="left-column">
                <div className="form-card">
                <h2 className="form-title">Användardetaljer</h2>
                {(!selectedUser || showCreateModal) && <div className="text-muted">Klicka på en användare i listan för att visa och redigera uppgifter.</div>}
                {!showCreateModal && selectedUser && (
                  <form className="kost-form" onSubmit={handleSaveSelectedUser}>
                    <div className="column">
                      <label className="form-title">Namn</label>
                      <input className="tag-input" value={selectedUser.displayName} onChange={(e) => setSelectedUser({ ...selectedUser, displayName: e.target.value })} />
                    </div>
                    <div className="column">
                      <label className="form-title">E-post</label>
                      <input className="tag-input" type="email" value={selectedUser.email} onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })} />
                    </div>
                    <div className="column">
                      <label className="form-title">Telefon</label>
                      <input className="tag-input" type="tel" value={selectedUser.phone || ''} onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })} />
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <button type="submit" className="submit-button" disabled={saving}>{saving ? 'Sparar...' : 'Spara'}</button>
                      <button type="button" className="submit-button" style={{ marginLeft: '0.5rem' }} onClick={async () => {
                        // delete immediately
                        if (!selectedUser?.id) { setSaveMessage({ type: 'error', text: 'Ingen användare vald.' }); return; }
                        setSaving(true);
                        try {
                          const res = await fetch(`/api/user-management/admin/users/${selectedUser.id}`, { method: 'DELETE', headers: getAuthHeaders() });
                          if (!res.ok) {
                            const text = await res.text();
                            throw new Error(`${res.status} ${res.statusText} - ${text}`);
                          }
                          setSaveMessage({ type: 'success', text: 'Användare borttagen.' });
                          setSelectedUser(null);
                          fetchUsers();
                        } catch (err) {
                          setSaveMessage({ type: 'error', text: 'Kunde inte ta bort användare: ' + (err.message || err) });
                        } finally {
                          setSaving(false);
                        }
                      }}>Ta bort</button>
                    </div>
                    {saveMessage && <div className={`message ${saveMessage.type}`} style={{ marginTop: '0.5rem' }}>{saveMessage.text}</div>}
                      {/* Typ field removed from details form per request (type remains editable when creating a user) */}
                    {/* Save is always enabled when not saving */}
                  </form>
                )}

              </div>

              {showCreateModal && (
                <div className="form-card" style={{ marginBottom: '1rem' }}>
                  <h3 className="form-title">Skapa användare</h3>
                  <form onSubmit={async (e) => { e.preventDefault(); const ok = await handleCreateUser(e); if (ok) setShowCreateModal(false); }} className="kost-form">
                    <div className="column">
                      <label className="form-title">Namn</label>
                      <input className="tag-input" value={newName} onChange={(e) => setNewName(e.target.value)} />
                    </div>
                    <div className="column">
                      <label className="form-title">E-post</label>
                      <input className="tag-input" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                    </div>
                    <div className="column">
                      <label className="form-title">Telefon</label>
                      <input className="tag-input" type="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
                    </div>
                    <div className="column">
                      <label className="form-title">Typ</label>
                      <select className="tag-input" value={newType} onChange={(e) => setNewType(e.target.value)}>
                        <option value="ADMIN">Administratör</option>
                        <option value="CAREGIVER">Vårdgivare</option>
                        <option value="RESIDENT">Patient</option>
                      </select>
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <button type="submit" className="submit-button" disabled={creating || !newName || !newEmail}>{creating ? 'Skapar...' : 'Skapa användare'}</button>
                      <button type="button" className="submit-button" style={{ marginLeft: '0.5rem' }} onClick={() => setShowCreateModal(false)}>Avbryt</button>
                    </div>
                    {createMessage && <div className={`message ${createMessage.type}`} style={{ marginTop: '0.5rem' }}>{createMessage.text}</div>}
                  </form>
                </div>
              )}

            </div>

            <div className="right-column">
              <div className="form-card admin-user-list">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="form-title" style={{ margin: 0 }}>Alla användare</h2>
                <div>
                  <button className="submit-button" onClick={() => { setSelectedUser(null); setShowCreateModal(true); }}>Ny användare</button>
                </div>
              </div>
              {loadingUsers && <div className="text-muted">Laddar användare...</div>}
              {!loadingUsers && usersError && <div className="text-muted">Kunde inte hämta användare: visar exempeldata.</div>}

              {/* Create form is placed under 'Användardetaljer' instead; not shown inside the user list */}

              <div style={{ marginTop: '0.5rem' }}>
                  {allUsers.length > 0 ? (
                  allUsers.map((u) => (
                    <div key={u.id || u.email} className="user-item" style={{ cursor: 'pointer' }} onClick={() => setSelectedUser(u)}>
                      <span style={{ textDecoration: 'underline' }}>{u.displayName || u.email}</span>
                        <span className="text-muted" style={{ marginLeft: '0.5rem' }}>{ROLE_LABELS[u.userType] || u.userType}</span>
                      {u._temp && <span style={{ fontSize: '0.8rem', color: '#999', marginLeft: '0.5rem' }}>(temp)</span>}
                    </div>
                  ))
                ) : (
                  mockUsers.map((u) => (
                    <div key={u.id} className="user-item" style={{ cursor: 'pointer' }} onClick={() => setSelectedUser(u)}>
                      <span style={{ textDecoration: 'underline' }}>{u.displayName || u.email}</span>
                      <span className="text-muted" style={{ marginLeft: '0.5rem' }}>{ROLE_LABELS[u.userType] || u.userType}</span>
                    </div>
                  ))
                )}
              </div>
              </div>
            </div>
            </>
          ) : null}

          {/* Caregiver view: show assigned patients list */}
          {user.userType === 'CAREGIVER' && (
            <>
            <div className="left-column">
              <div className="form-card">
                <h2 className="form-title">Användardetaljer</h2>
                {selectedUser ? (
                  <form className="kost-form" onSubmit={handleSaveCaretaker}>
                    <div className="column">
                      <label className="form-title">Namn</label>
                      <input className="tag-input" value={selectedUser.displayName || ''} onChange={(e) => setSelectedUser({ ...selectedUser, displayName: e.target.value })} />
                    </div>
                    <div className="column">
                      <label className="form-title">E-post</label>
                      <input className="tag-input" type="email" value={selectedUser.email || ''} onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })} />
                    </div>
                    <div className="column">
                      <label className="form-title">Telefon</label>
                      <input className="tag-input" type="tel" value={selectedUser.phone || ''} onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })} />
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <button type="submit" className="submit-button" disabled={saving}>{saving ? 'Sparar...' : 'Spara'}</button>
                      <button type="button" className="submit-button" style={{ marginLeft: '0.5rem' }} onClick={async () => {
                        // delete caretaker immediately
                        if (!selectedUser?.id) { setSaveMessage({ type: 'error', text: 'Ingen användare vald.' }); return; }
                        setSaving(true);
                        try {
                          const res = await fetch(`/api/user-management/caretakers/${selectedUser.id}`, { method: 'DELETE', headers: getAuthHeaders() });
                          if (!res.ok) {
                            const text = await res.text();
                            throw new Error(`${res.status} ${res.statusText} - ${text}`);
                          }
                          // refresh list and restore initial UI
                          await fetchAssignedPatients();
                          setSelectedUser(null);
                          setSaveMessage(null);
                          setCreateMessage(null);
                        } catch (err) {
                          setSaveMessage({ type: 'error', text: 'Kunde inte ta bort användare: ' + (err.message || err) });
                        } finally {
                          setSaving(false);
                        }
                      }}>Ta bort</button>
                      <button type="button" className="submit-button" style={{ marginLeft: '0.5rem' }} onClick={async () => {
                        // cancel edit and restore initial state
                        setSelectedUser(null);
                        setSaveMessage(null);
                        await fetchAssignedPatients();
                      }}>Avbryt</button>
                    </div>
                    {saveMessage && <div className={`message ${saveMessage.type}`} style={{ marginTop: '0.5rem' }}>{saveMessage.text}</div>}
                  </form>
                ) : (
                  <div className="text-muted">Klicka på en patient i listan för att visa och redigera uppgifter.</div>
                )}
                {/* Permissions card for caregiver -> patient: only show when a patient is selected */}
                {selectedUser && (
                  <div style={{ marginTop: '1rem' }} className="permissions-section">
                    <h3 className="form-title">Behörigheter</h3>
                    <div style={{ marginTop: '0.5rem', textAlign: 'left' }}>
                      {/* Only the patient's permissions are shown and editable */}
                    </div>
                    <div style={{ marginTop: '0.75rem', textAlign: 'left' }}>
                      <div style={{ fontWeight: 600 }}>Patientens behörigheter</div>
                      {loadingPermissions && <div className="text-muted">Laddar behörigheter...</div>}
                      {!loadingPermissions && permissionsError && <div className="text-muted">Kunde inte hämta behörigheter.</div>}
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        if (!selectedUser?.id) return;
                        try {
                          const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
                          const body = { permissions: patientPermissions };
                          const res = await fetch(`/api/user-management/caretakers/${selectedUser.id}/permissions`, { method: 'PUT', headers, body: JSON.stringify(body) });
                          if (!res.ok) {
                            const text = await res.text();
                            throw new Error(`${res.status} ${res.statusText} - ${text}`);
                          }
                          // refresh list and show saved
                          setSaveMessage({ type: 'success', text: 'Behörigheter uppdaterade.' });
                          await fetchAssignedPatients();
                          await fetchPatientPermissions(selectedUser.id);
                        } catch (err) {
                          setSaveMessage({ type: 'error', text: 'Kunde inte uppdatera behörigheter: ' + (err.message || err) });
                        }
                      }}>
                        <div style={{ marginTop: '0.5rem' }}>
                          {[
                            { key: 'CREATE_REMINDERS', label: 'Skapa påminnelser' },
                            { key: 'VIEW_REMINDERS', label: 'Visa påminnelser' },
                            { key: 'MEAL_REQUIREMENTS', label: 'Måltidskrav' },
                            { key: 'MEAL_SUGGESTIONS', label: 'Måltidsförslag' },
                            { key: 'STATISTICS', label: 'Statistik' },
                          ].map((perm) => (
                            <label key={perm.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', justifyContent: 'flex-start' }}>
                              <input type="checkbox" checked={patientPermissions.includes(perm.key)} onChange={(e) => {
                                if (e.target.checked) setPatientPermissions((prev) => Array.from(new Set([...prev, perm.key])));
                                else setPatientPermissions((prev) => prev.filter((x) => x !== perm.key));
                              }} />
                              <span>{perm.label}</span>
                            </label>
                          ))}
                        </div>
                        <div style={{ marginTop: '0.5rem' }}>
                          <button type="submit" className="submit-button">Spara behörigheter</button>
                          <button type="button" className="submit-button" style={{ marginLeft: '0.5rem' }} onClick={async () => { setPatientPermissions([]); if (selectedUser?.id) await fetchPatientPermissions(selectedUser.id); setSaveMessage(null); }}>Återställ</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="right-column">
              <div className="form-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 className="form-title">Mina patienter</h2>
                  <div>
                    <button className="submit-button" onClick={() => { setSelectedUser(null); setShowCreateModal(true); }}>Ny användare</button>
                  </div>
                </div>
                {loadingAssigned && <div className="text-muted">Laddar patienter...</div>}
                {!loadingAssigned && assignedError && <div className="text-muted">Kunde inte hämta patienter.</div>}
                <div style={{ marginTop: '0.5rem' }}>
                  {assignedPatients && assignedPatients.length > 0 ? (
                    assignedPatients.map((p) => (
                      <div key={p.id || p.email} className="user-item" style={{ cursor: 'pointer' }} onClick={() => setSelectedUser(p)}>
                        <span style={{ textDecoration: 'underline' }}>{p.displayName || p.email}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-muted">Inga patienter tilldelade.</div>
                  )}
                </div>
              </div>
            </div>

            {showCreateModal && (
              <div className="left-column">
                <div className="form-card" style={{ marginTop: '1rem' }}>
                  <h3 className="form-title">Skapa användare</h3>
                  <form onSubmit={async (e) => { e.preventDefault(); const ok = await handleCreateCaretaker(e); if (ok) setShowCreateModal(false); }} className="kost-form">
                    <div className="column">
                      <label className="form-title">Namn</label>
                      <input className="tag-input" value={newName} onChange={(e) => setNewName(e.target.value)} />
                    </div>
                    <div className="column">
                      <label className="form-title">E-post</label>
                      <input className="tag-input" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                    </div>
                    <div className="column">
                      <label className="form-title">Telefon</label>
                      <input className="tag-input" type="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <button type="submit" className="submit-button" disabled={creating || !newName || !newEmail}>{creating ? 'Skapar...' : 'Skapa användare'}</button>
                      <button type="button" className="submit-button" style={{ marginLeft: '0.5rem' }} onClick={() => { setShowCreateModal(false); setNewName(''); setNewEmail(''); setNewPhone(''); setCreateMessage(null); }}>Avbryt</button>
                    </div>
                    {createMessage && <div className={`message ${createMessage.type}`} style={{ marginTop: '0.5rem' }}>{createMessage.text}</div>}
                  </form>
                </div>
              </div>
            )}
            </>
          )}
          {/* Home icon anchored relative to the last visible card */}
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: '12px' }}>
            <Link to="/">
              <img src={homeIcon} alt="Tillbaka till startsidan" style={{ width: '64px', cursor: 'pointer' }} />
            </Link>
          </div>
        </section>
      )}
      {/* Immediate delete - confirmation modal removed per request */}
      {/* debug UI removed */}
    </div>
  );
}
