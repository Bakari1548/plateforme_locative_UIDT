import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">CROUS-T</h1>
            <p className="text-gray-600">Plateforme de Gestion Locative</p>
            <div className="mt-6 space-x-4">
              <a href="/login" className="inline-block px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">Connexion</a>
              <a href="/register" className="inline-block px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">Inscription</a>
            </div>
          </div>
        </div>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  )
}

export default App
