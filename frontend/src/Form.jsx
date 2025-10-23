import React, { useState, useEffect } from "react"; // Lägg till useEffect här
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import homeIcon from "./images/home.png";
import "./form.css";

// Hjälpfunktion för att översätta användarkategorier till svenska
const translateUserType = (userType) => {
  switch (userType) {
    case 'ADMIN':
      return 'Administratör';
    case 'CAREGIVER':
      return 'Vårdgivare';
    case 'RESIDENT':
      return 'Boende';
    default:
      return userType;
  }
};

const kostAlternativ = [
  "Vegetarisk",
  "Vegansk",
  "Prescetarian",
  "Halal",
  "Kosher",
  "Glutenfri",
  "Laktosfri",
  "Äggfri",
  "Nötfri",
  "Diabetesanpassad",
  "FODMAP",
  "Annat",
];

const Form = () => {
  const { user, getAuthHeaders, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminOrCaregiver = user?.userType === 'ADMIN' || user?.userType === 'CAREGIVER';
  const viewedPatientName = location?.state?.viewedPatientName || null;
  const viewedPatientId = location?.state?.viewedPatientId || null;
  const [savedPreferences, setSavedPreferences] = useState([]);
  const [availablePreferences, setAvailablePreferences] = useState([]);
  const [customText, setCustomText] = useState("");
  const [customTags, setCustomTags] = useState([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Helper function to get the correct user ID for API calls
  const getTargetUserId = () => {
    if (user.userType === 'CAREGIVER' && viewedPatientId) {
      return viewedPatientId;
    }
    return user.id;
  };

  // Hämta sparade preferenser när komponenten monteras
  useEffect(() => {
    const fetchRequirements = async () => {
      if (!user?.id) return; // Don't fetch if user is not logged in
      
      const targetUserId = getTargetUserId();
      
      try {
        const response = await fetch(
          `/api/users/${targetUserId}/meal-requirements`,
          {
            headers: getAuthHeaders()
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Extrahera bara requirement-värdena från response
        const requirements = data.requirements.map((req) => req.requirement);
        
        // Separera standardkost från "annat"
        const standardKost = new Set(kostAlternativ.filter((k) => k !== "Annat"));
        const savedStandard = requirements.filter((req) => standardKost.has(req));
        const savedCustom = requirements.filter((req) => !standardKost.has(req));
        
        // Sätt sparade preferenser
        setSavedPreferences(savedStandard);
        
        // Sätt tillgängliga preferenser (alla standardkost som inte är sparade)
        const available = kostAlternativ.filter((k) => k !== "Annat" && !savedStandard.includes(k));
        setAvailablePreferences(available);
        
        // Sätt custom tags om det finns
        if (savedCustom.length > 0) {
          setCustomTags(savedCustom);
          setCustomText(savedCustom.join("\n")); // Keep for backward compatibility
        } else {
          setCustomTags([]);
          setCustomText("");
        }
      } catch (error) {
        console.error("Error fetching requirements:", error);
        setError("Kunde inte hämta sparade kostpreferenser", error.status);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequirements();
  }, [user, getAuthHeaders, viewedPatientId]); // Re-fetch when user or viewed patient changes

  // Flytta från tillgängliga till sparade
  const moveToSaved = (preference) => {
    setAvailablePreferences(prev => prev.filter(p => p !== preference));
    setSavedPreferences(prev => [...prev, preference]);
  };

  // Flytta från sparade till tillgängliga
  const moveToAvailable = (preference) => {
    setSavedPreferences(prev => prev.filter(p => p !== preference));
    setAvailablePreferences(prev => [...prev, preference]);
  };

  // Ta bort från sparade
  const removeFromSaved = (preference) => {
    setSavedPreferences(prev => prev.filter(p => p !== preference));
    setAvailablePreferences(prev => [...prev, preference]);
  };

  // Tag-based input functions
  const addCustomTag = () => {
    const trimmedInput = newTagInput.trim();
    if (trimmedInput && !customTags.includes(trimmedInput)) {
      setCustomTags(prev => [...prev, trimmedInput]);
      setNewTagInput("");
    }
  };

  const removeCustomTag = (tagToRemove) => {
    setCustomTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomTag();
    }
  };

  const hanteraSubmit = async (e) => {
    e.preventDefault();

    // Kombinera sparade preferenser med custom tags
    const dataAttSkicka = [...savedPreferences, ...customTags];

    // Formattera data enligt API-specifikationen
    const requestData = {
      requirements: dataAttSkicka,
    };

    const targetUserId = getTargetUserId();

    try {
      const response = await fetch(
        `/api/users/${targetUserId}/meal-requirements`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Sparade kostpreferenser:", data.requirements);
      
      // Uppdatera båda boxarna baserat på nya sparade preferenser
      const newRequirements = data.requirements.map((req) => req.requirement);
      const standardKost = new Set(kostAlternativ.filter((k) => k !== "Annat"));
      const newSavedStandard = newRequirements.filter((req) => standardKost.has(req));
      const newSavedCustom = newRequirements.filter((req) => !standardKost.has(req));
      
      setSavedPreferences(newSavedStandard);
      setAvailablePreferences(kostAlternativ.filter((k) => k !== "Annat" && !newSavedStandard.includes(k)));
      setCustomTags(newSavedCustom);
      setCustomText(newSavedCustom.length > 0 ? newSavedCustom.join("\n") : "");
      
      // Visa framgångsmeddelande
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error:", error);
      // TODO: Lägg till felmeddelande till användaren här
    }
  };

  if (isLoading) return <div>Laddar...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {/* Top bar med user info och logout - samma standard som andra sidor */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        width: '100%',
        marginBottom: '20px', 
        padding: '0 12px'
      }}>
        <div style={{ 
          backgroundColor: 'rgba(255,255,255,0.95)', 
          padding: '12px 16px', 
          borderRadius: '8px', 
          fontSize: '14px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)', 
          border: '1px solid #e0e0e0'
        }}>
          <div>
            <span className="text-muted">Inloggad som: </span>
            <strong style={{ color: '#316e70' }}>{user?.displayName || user?.email}</strong>
            <span className="badge bg-primary ms-2" style={{ fontSize: '11px' }}>{translateUserType(user?.userType)}</span>
          </div>
          {viewedPatientName && (
            <div style={{ marginTop: '8px', padding: '6px 8px', backgroundColor: '#e8f4f8', borderRadius: '4px', border: '1px solid #316e70' }}>
              <strong style={{ color: '#316e70', fontSize: '14px' }}>👤 Patient: {viewedPatientName}</strong>
            </div>
          )}
        </div>
        
        {isAdminOrCaregiver && (
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="btn btn-outline-danger btn-sm"
          >
            Logout
          </button>
        )}
      </div>

      <h1 className="reminder-title">
        Allergier och specialkost
      </h1>

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
          🍽️ Du hanterar kostpreferenser för: <strong>{viewedPatientName}</strong>
        </div>
      )}

      <section className="preference-boxes">
        <form onSubmit={hanteraSubmit}>
          <div className="boxes-container">
            {/* Sparade preferenser */}
            <div className="preference-box saved-box">
              <h2 className="box-title">Sparade preferenser</h2>
              <div className="preference-list">
                {savedPreferences.length === 0 ? (
                  <p className="empty-message">Inga sparade preferenser</p>
                ) : (
                  savedPreferences.map((pref, index) => (
                    <div key={index} className="preference-item">
                      <span className="preference-text">{pref}</span>
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeFromSaved(pref)}
                        title="Ta bort"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Tillgängliga preferenser */}
            <div className="preference-box available-box">
              <h2 className="box-title">Lägg till</h2>
              <div className="preference-list">
                {availablePreferences.length === 0 ? (
                  <p className="empty-message">Alla preferenser är sparade</p>
                ) : (
                  availablePreferences.map((pref, index) => (
                    <div key={index} className="preference-item">
                      <span className="preference-text">{pref}</span>
                      <button
                        type="button"
                        className="add-btn"
                        onClick={() => moveToSaved(pref)}
                        title="Lägg till"
                      >
                        +
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Custom tags section */}
          <div className="custom-section">
            <label className="form-title">
              Ange annan specialkost
            </label>
            
            {/* Display existing tags */}
            {customTags.length > 0 && (
              <div className="custom-tags-display">
                {customTags.map((tag, index) => (
                  <span key={index} className="custom-tag">
                    {tag}
                    <button
                      type="button"
                      className="tag-remove-btn"
                      onClick={() => removeCustomTag(tag)}
                      title="Ta bort"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            {/* Add new tag input */}
            <div className="tag-input-container">
              <input
                type="text"
                className="tag-input"
                placeholder="Skriv och tryck Enter för att lägga till..."
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyPress={handleTagInputKeyPress}
              />
              <button
                type="button"
                className="add-tag-btn"
                onClick={addCustomTag}
                disabled={!newTagInput.trim()}
              >
                +
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <button type="submit" className="modern-submit-button">
              Spara preferenser
            </button>
          </div>
        </form>
      </section>

      <div className="row mt-5">
        <div className="col-12 d-flex justify-content-center">
          {isAdminOrCaregiver && !viewedPatientName ? (
            <img
              src={homeIcon}
              alt="Hem (otillgänglig)"
              className="disabled-home"
              title="Inte tillgänglig för administratörer eller vårdgivare"
              aria-label="Hem (otillgänglig för administratörer eller vårdgivare)"
              style={{ width: "80px" }}
            />
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

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Framgång!</h3>
              <button 
                className="modal-close-btn"
                onClick={() => setShowSuccessModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Dina kostpreferenser har sparats framgångsrikt!</p>
            </div>
            <div className="modal-footer">
              <button 
                className="modal-ok-btn"
                onClick={() => setShowSuccessModal(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Form;
