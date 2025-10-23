import React, { useState } from 'react';

const DemoInstructions = () => {
  const [showInstructions, setShowInstructions] = useState(false);

  const demoCredentials = {
    admin: { email: "admin@demo.mos", password: "demo123", role: "Administratör" },
    caregiver: { email: "caregiver@demo.mos", password: "demo123", role: "Vårdgivare" },
    resident: { email: "resident@demo.mos", password: "demo123", role: "Boende" }
  };

  return (
    <div className="demo-instructions">
      <button 
        className="btn btn-outline-info btn-sm mb-3"
        onClick={() => setShowInstructions(!showInstructions)}
      >
        {showInstructions ? 'Dölj' : 'Visa'} Demo-instruktioner
      </button>

      {showInstructions && (
        <div className="card">
          <div className="card-header bg-info text-white">
            <h5 className="mb-0">📱 MOS Demo - Instruktioner</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <h6>🔐 Demo-inloggningar:</h6>
                <div className="demo-credentials">
                  {Object.entries(demoCredentials).map(([key, creds]) => (
                    <div key={key} className="mb-2 p-2 border rounded">
                      <strong>{creds.role}:</strong><br />
                      <small className="text-muted">
                        Email: <code>{creds.email}</code><br />
                        Lösenord: <code>{creds.password}</code>
                      </small>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="col-md-6">
                <h6>📱 Installera som app:</h6>
                <ol className="small">
                  <li>Öppna i webbläsare (Chrome/Safari)</li>
                  <li>Klicka på "Lägg till på startskärmen"</li>
                  <li>Appen fungerar offline!</li>
                </ol>
                
                <h6>💡 Demo-funktioner:</h6>
                <ul className="small">
                  <li>✅ Offline-funktionalitet</li>
                  <li>✅ Push-notifikationer</li>
                  <li>✅ Responsiv design</li>
                  <li>✅ Demo-data för alla roller</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-3 p-2 bg-light rounded">
              <small className="text-muted">
                <strong>Tips:</strong> Testa olika roller för att se olika funktioner. 
                Appen fungerar även offline efter första laddningen.
              </small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoInstructions;
