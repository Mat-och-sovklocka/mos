import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Reminders from './Reminders.jsx' // Importera komponenten

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Reminders /> {/* Lägg till komponenten här */}
    </>
  )
}

export default App
