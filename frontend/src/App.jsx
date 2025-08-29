import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Reminders from './Reminders.jsx' // Importera komponenten
import Home from './Home.jsx';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Home /> {/* Lägg till komponenten här */}
    </>
  )
}

export default App
