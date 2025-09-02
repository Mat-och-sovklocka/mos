import React, { useState } from "react";
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

  const hanteraCheckbox = (kost) => {
    setValdaKost((prev) =>
      prev.includes(kost)
        ? prev.filter((item) => item !== kost)
        : [...prev, kost]
    );
  };

  const hanteraSubmit = (e) => {
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

    alert("Skickar till backend:\n" + JSON.stringify(dataAttSkicka, null, 2));
    // Här kan du ersätta alert med en riktig fetch till backend
  };

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
