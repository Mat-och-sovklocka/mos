import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import Reminders from './Reminders.jsx' // Importera komponenten
import Home from './Home.jsx';
import Form from './Form.jsx';




function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="/form" element={<Form />} />
      </Routes>
    </Router>
  );
}

export default App
