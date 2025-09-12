import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import Reminders from './Reminders.jsx' // Importera komponenten
import Home from './Home.jsx';
import Form from './Form.jsx';
import Reminderlist from './Reminderlist.jsx';

import '@fortawesome/fontawesome-free/css/all.min.css';



function App() {
  const [count, setCount] = useState(0)

  return (
    
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="/form" element={<Form />} />
        <Route path="/reminderlist" element={<Reminderlist />} />
      </Routes>
    </Router>
  );
}

export default App
