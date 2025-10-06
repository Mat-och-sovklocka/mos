import React, { useState, useEffect } from "react"; // Lägg till useEffect här
import { Link } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import homeIcon from "./images/home.png";
import "./form.css";

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
  const { user, getAuthHeaders } = useAuth();
  const [savedPreferences, setSavedPreferences] = useState([]);
  const [availablePreferences, setAvailablePreferences] = useState([]);
  const [customText, setCustomText] = useState("");
  const [customTags, setCustomTags] = useState([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hämta sparade preferenser när komponenten monteras
  useEffect(() => {
    const fetchRequirements = async () => {
      if (!user?.id) return; // Don't fetch if user is not logged in
      
      try {
        const response = await fetch(
          `/api/users/${user.id}/meal-requirements`,
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
  }, [user, getAuthHeaders]); // Re-fetch when user changes

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

    try {
      const response = await fetch(
        `/api/users/${user.id}/meal-requirements`,
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
      
      // TODO: Lägg till användarvänlig feedback här
    } catch (error) {
      console.error("Error:", error);
      // TODO: Lägg till felmeddelande till användaren här
    }
  };

  if (isLoading) return <div>Laddar...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1 className="reminder-title">
        Allergier och specialkost
      </h1>

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

          <button type="submit" className="submit-button">
            Spara preferenser
          </button>
        </form>
      </section>

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
};

export default Form;
