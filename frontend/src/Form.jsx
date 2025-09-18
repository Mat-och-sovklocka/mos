import React, { useState, useEffect } from "react"; // Lägg till useEffect här
import { Link } from "react-router-dom";
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
  const [valdaKost, setValdaKost] = useState([]);
  const [annatText, setAnnatText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hämta sparade preferenser när komponenten monteras
  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        const userId = "11111111-1111-1111-1111-111111111111"; // Hårdkodad för test
        const response = await fetch(
          `http://localhost:8080/api/users/${userId}/meal-requirements`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Extrahera bara requirement-värdena från response och uppdatera state
        const requirements = data.requirements.map((req) => req.requirement);
        setValdaKost(requirements);

        // Om någon requirement inte finns i kostAlternativ, lägg till i annatText
        const standardKost = new Set(
          kostAlternativ.filter((k) => k !== "Annat")
        );
        const annatKost = requirements.filter(
          (req) => !standardKost.has(req)
        );

        if (annatKost.length > 0) {
          setValdaKost((prev) => [...prev.filter((k) => k !== "Annat"), "Annat"]);
          setAnnatText(annatKost.join("\n"));
        }
      } catch (error) {
        console.error("Error fetching requirements:", error);
        setError("Kunde inte hämta sparade kostpreferenser", response.status);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequirements();
  }, []); // Tom dependency array betyder att detta körs en gång när komponenten monteras

  const hanteraCheckbox = (kost) => {
    setValdaKost((prev) =>
      prev.includes(kost)
        ? prev.filter((item) => item !== kost)
        : [...prev, kost]
    );
  };

  const hanteraSubmit = async (e) => {
    e.preventDefault();

    // Ta bort "Annat" från listan
    const dataAttSkicka = [...valdaKost.filter((kost) => kost !== "Annat")];

    // Lägg till varje rad från textarean som eget värde
    if (valdaKost.includes("Annat") && annatText.trim()) {
      const extraRader = annatText
        .split("\n")
        .map((rad) => rad.trim())
        .filter((rad) => rad.length > 0);

      dataAttSkicka.push(...extraRader);
    }

    // Formattera data enligt API-specifikationen
    const requestData = {
      requirements: dataAttSkicka,
    };

    try {
      const userId = "11111111-1111-1111-1111-111111111111"; // Hårdkodad för test
      const response = await fetch(
        `http://localhost:8080/api/users/${userId}/meal-requirements`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Sparade kostpreferenser:", data.requirements);
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
      <h1 className="display-4 text-center mb-3 app-title fw-bold">
        Allergier och specialkost
      </h1>

      <section className="kost-form">
        <form className="kost-form" onSubmit={hanteraSubmit}>
          <h2 className="form-title">Välj typ av specialkost</h2>
          <div className="kost-grid">
            {kostAlternativ.map((kost, index) => (
              <label key={index} className="custom-checkbox">
                <input
                  type="checkbox"
                  checked={valdaKost.includes(kost)}
                  onChange={() => hanteraCheckbox(kost)}
                />
                <span className="checkmark"></span>
                <span className="label-text">{kost}</span>
              </label>
            ))}

            {valdaKost.includes("Annat") && (
              <div className="column">
                <label htmlFor="other" className="form-title">
                  Ange annan specialkost
                </label>
                <textarea
                  id="other"
                  className="kost-textarea"
                  placeholder="Skriv här och tryck på enter mellan dina vali fall flera val anges"
                  value={annatText}
                  onChange={(e) => setAnnatText(e.target.value)}
                />
              </div>
            )}
          </div>

          <button type="submit" className="submit-button">
            Skicka
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
