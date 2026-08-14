import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/public/Home'
import Presentation from './pages/public/Presentation'
import Procedure from './pages/public/Procedure'
import Contact from './pages/public/Contact'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AdminUsers from './pages/Admin/Users'
import DepotDemande from './pages/Locataire/DepotDemande'
import SuiviDemande from './pages/Locataire/SuiviDemande'
import MesPaiements from './pages/Locataire/MesPaiements'
import MonContrat from './pages/Locataire/MonContrat'
import InstructionDemandes from './pages/DCUV/InstructionDemandes'
import GestionContrats from './pages/DCUV/GestionContrats'
import GestionLocaux from './pages/DCUV/GestionLocaux'
import ExamenDossiers from './pages/Commission/ExamenDossiers'
import ValidationDecisions from './pages/Directeur/ValidationDecisions'
import EnregistrementPaiement from './pages/AgentRecouv/EnregistrementPaiement'
import SignalementIncident from './pages/Locataire/SignalementIncident'
import TechnicienBoard from './pages/Technicien/TableauBord'
import ControleQHSE from './pages/DCUV/ControleQHSE'
import SupervisionInterventions from './pages/DCUV/SupervisionInterventions'
import GestionCourriers from './pages/Courriers/GestionCourriers'
import AppLayout from './components/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/presentation" element={<Presentation />} />
        <Route path="/procedure" element={<Procedure />} />
        <Route path="/contact" element={<Contact />} />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Depot demande - standalone page (not in dashboard) */}
        <Route path="/demandes/nouveau" element={
          <ProtectedRoute roles={['visiteur', 'locataire']}>
            <DepotDemande />
          </ProtectedRoute>
        } />

        {/* Shared routes - accessible by visiteur and locataire */}
        <Route path="/demandes" element={
          <ProtectedRoute roles={['visiteur', 'locataire']}>
            <AppLayout><SuiviDemande /></AppLayout>
          </ProtectedRoute>
        } />

        {/* Dashboard - restricted to locataire and staff */}
        <Route path="/dashboard" element={
          <ProtectedRoute roles={['locataire', 'dcuv', 'directeur', 'technicien', 'agentRecouv', 'admin', 'agentCourrier', 'secretaireCSA']}>
            <AppLayout><Dashboard /></AppLayout>
          </ProtectedRoute>
        } />

        {/* Locataire-only routes */}
        <Route path="/paiements" element={
          <ProtectedRoute roles={['locataire']}>
            <AppLayout><MesPaiements /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/mon-contrat" element={
          <ProtectedRoute roles={['locataire']}>
            <AppLayout><MonContrat /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/incidents" element={
          <ProtectedRoute roles={['locataire']}>
            <AppLayout><SignalementIncident /></AppLayout>
          </ProtectedRoute>
        } />

        {/* DCUV routes */}
        <Route path="/dcuv/demandes" element={
          <ProtectedRoute roles={['dcuv', 'admin']}>
            <AppLayout><InstructionDemandes /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/dcuv/contrats" element={
          <ProtectedRoute roles={['dcuv', 'admin', 'directeur']}>
            <AppLayout><GestionContrats /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/dcuv/locaux" element={
          <ProtectedRoute roles={['dcuv', 'admin']}>
            <AppLayout><GestionLocaux /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/dcuv/qhse" element={
          <ProtectedRoute roles={['dcuv', 'admin']}>
            <AppLayout><ControleQHSE /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/dcuv/interventions" element={
          <ProtectedRoute roles={['dcuv', 'admin']}>
            <AppLayout><SupervisionInterventions /></AppLayout>
          </ProtectedRoute>
        } />

        {/* Commission route */}
        <Route path="/commission" element={
          <ProtectedRoute roles={['secretaireCSA', 'admin']}>
            <AppLayout><ExamenDossiers /></AppLayout>
          </ProtectedRoute>
        } />

        {/* Directeur route */}
        <Route path="/directeur" element={
          <ProtectedRoute roles={['directeur', 'admin']}>
            <AppLayout><ValidationDecisions /></AppLayout>
          </ProtectedRoute>
        } />

        {/* Agent recouvrement route */}
        <Route path="/recouvrement" element={
          <ProtectedRoute roles={['agentRecouv', 'admin']}>
            <AppLayout><EnregistrementPaiement /></AppLayout>
          </ProtectedRoute>
        } />

        {/* Technicien route */}
        <Route path="/technicien" element={
          <ProtectedRoute roles={['technicien', 'admin']}>
            <AppLayout><TechnicienBoard /></AppLayout>
          </ProtectedRoute>
        } />

        {/* Courriers route */}
        <Route path="/courriers" element={
          <ProtectedRoute roles={['agentCourrier', 'dcuv', 'admin', 'secretaireCSA']}>
            <AppLayout><GestionCourriers /></AppLayout>
          </ProtectedRoute>
        } />

        {/* Admin routes */}
        <Route path="/admin/users" element={
          <ProtectedRoute roles={['admin']}>
            <AppLayout><AdminUsers /></AppLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App
