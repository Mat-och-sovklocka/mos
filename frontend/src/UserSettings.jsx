import React, { useEffect, useState } from 'react';
import { useAuth } from './contexts/AuthContext';

export default function UserSettings() {
  const { user, getAuthHeaders } = useAuth();

  // Personal settings
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Admin: users list + create
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState(null);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newType, setNewType] = useState('RESIDENT');
  const [creating, setCreating] = useState(false);
  const [createMessage, setCreateMessage] = useState(null);

  const mockUsers = [
    { id: 'm-1', displayName: 'Boende Exempel', email: 'boende@example.com', userType: 'RESIDENT' },
    { id: 'm-2', displayName: 'Vårdare Exempel', email: 'vardare@example.com', userType: 'CAREGIVER' },
  ];

  useEffect(() => {
    if (user?.userType === 'ADMIN') fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
      setAllUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Could not fetch users, showing fallback mock users', err);
      setUsersError(err.message || String(err));
      setAllUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      const res = await fetch('/api/user/me', { method: 'PUT', headers, body: JSON.stringify({ displayName, email }) });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      setMessage({ type: 'success', text: 'Sparat.' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Ett fel uppstod vid sparande.' });
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    setCreating(true);
    setCreateMessage(null);
    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      const body = { name: newName, email: newEmail, userType: newType };
      const res = await fetch('/api/user-management/admin/users', { method: 'POST', headers, body: JSON.stringify(body) });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status} ${res.statusText} - ${text}`);
      }
      const created = await res.json();
      // Add to list optimistically (mark temp if id missing)
      setAllUsers((prev) => [{ ...(created || {}), _temp: !created?.id }, ...prev]);
      setCreateMessage({ type: 'success', text: 'Användare skapad.' });
      setNewName('');
      setNewEmail('');
      setNewType('RESIDENT');
    } catch (err) {
      console.error(err);
      setCreateMessage({ type: 'error', text: 'Kunde inte skapa användare: ' + (err.message || err) });
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <h1 className="reminder-title">Användarinställningar</h1>

      {!user && <p className="empty-message">Inloggning krävs för att visa och ändra inställningar.</p>}

      {user && (
        <section className="preference-boxes user-settings-grid">
          <div className="form-card">
            <form onSubmit={handleSave} className="kost-form">
              <div className="column">
                <label className="form-title">Visningsnamn</label>
                <input className="tag-input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </div>

              <div className="column">
                <label className="form-title">E-post</label>
                <input className="tag-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div style={{ marginTop: '1rem' }}>
                <button type="submit" className="submit-button" disabled={saving}>{saving ? 'Sparar...' : 'Spara inställningar'}</button>
              </div>

              {message && <div className={`message ${message.type}`}>{message.text}</div>}
            </form>
          </div>

          {user.userType === 'ADMIN' && (
            <div className="form-card admin-user-list">
              <h2 className="form-title">Administrera användare</h2>

              <form onSubmit={handleCreateUser} className="kost-form">
                <div className="column">
                  <label className="form-title">Namn</label>
                  <input className="tag-input" value={newName} onChange={(e) => setNewName(e.target.value)} />
                </div>

                <div className="column">
                  <label className="form-title">E-post</label>
                  <input className="tag-input" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                </div>

                <div className="column">
                  <label className="form-title">Typ</label>
                  <select className="tag-input" value={newType} onChange={(e) => setNewType(e.target.value)}>
                    <option value="ADMIN">ADMIN</option>
                    <option value="CAREGIVER">CAREGIVER</option>
                    <option value="RESIDENT">RESIDENT</option>
                  </select>
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  <button type="submit" className="submit-button" disabled={creating || !newName || !newEmail}>{creating ? 'Skapar...' : 'Skapa användare'}</button>
                </div>

                {createMessage && <div className={`message ${createMessage.type}`} style={{ marginTop: '0.5rem' }}>{createMessage.text}</div>}
              </form>

              <div style={{ marginTop: '1rem' }}>
                <h3 className="form-title">Alla användare</h3>
                {loadingUsers && <div className="text-muted">Laddar användare...</div>}
                {!loadingUsers && usersError && <div className="text-muted">Kunde inte hämta användare: visar exempeldata.</div>}

                <div>
                  {allUsers.length > 0 ? (
                    allUsers.map((u) => (
                      <div key={u.id || u.email} className="user-item">
                        <span>{u.displayName || u.email}</span>
                        <span className="text-muted" style={{ marginLeft: '0.5rem' }}>{u.userType}</span>
                        {u._temp && <span style={{ fontSize: '0.8rem', color: '#999', marginLeft: '0.5rem' }}>(temp)</span>}
                      </div>
                    ))
                  ) : (
                    mockUsers.map((u) => (
                      <div key={u.id} className="user-item">
                        <span>{u.displayName || u.email}</span>
                        <span className="text-muted" style={{ marginLeft: '0.5rem' }}>{u.userType}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
