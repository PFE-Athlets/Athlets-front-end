import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import './App.css'
import { AppShell } from './components/AppShell.jsx'
import { PageView } from './pages/PageView.jsx'
import LoginPage from './pages/LoginPage.jsx'
import CreateAthletePage from './pages/CreateAthletePage.jsx'
import CreatePhysicalTestPage from './pages/CreatePhysicalTestPage.jsx'

const pages = [
  {
    path: '/tableau-de-bord',
    title: 'Tableau de bord',
    subtitle: 'Vue globale de l’activité du club',
  },
  {
    path: '/athletes',
    title: 'Athlètes',
    subtitle: 'Gestion de la liste des athlètes',
  },
  {
    path: '/athletes/creer',
    title: 'Créer un athlète',
    subtitle: 'Ajout d’un nouvel athlète',
  },
  {
    path: '/tests-physiques',
    title: 'Tests physiques',
    subtitle: 'Suivi des évaluations physiques',
  },
  {
    path: '/tests-physiques/creer',
    title: 'Créer un test physique',
    subtitle: 'Ajout d’un nouveau test physique',
  },
  {
    path: '/resultats',
    title: 'Résultats',
    subtitle: 'Analyse et comparaison des performances',
  },
  {
    path: '/seances',
    title: 'Séances',
    subtitle: 'Planning et historique des séances',
  },
  {
    path: '/rapports',
    title: 'Rapports',
    subtitle: 'Export et synthèse des données',
  },
  {
    path: '/parametres',
    title: 'Paramètres',
    subtitle: 'Réglages de l’application',
  },
]

function App() {
  const navigate = useNavigate()

  // hardcoded user info for demo purposes
  const shellProps = {
    activeUserName: 'Camille Tremblay',
    activeUserRole: 'Coach',
    notificationsCount: 2,
  }

  const getPrimaryActionLabel = (path) => {
    if (path === '/athletes') return 'Créer un athlète'
    if (path === '/tests-physiques') return 'Créer un test physique'
    return undefined
  }

  const handlePrimaryAction = (path) => {
    if (path === '/athletes') {
      navigate('/athletes/creer')
    }

    if (path === '/tests-physiques') {
      navigate('/tests-physiques/creer')
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/connexion" replace />} />
      <Route path="/connexion" element={<LoginPage />} />

      {pages.map((page) => (
        <Route
          key={page.path}
          path={page.path}
          element={
            <AppShell
              pageTitle={page.title}
              pageSubtitle={page.subtitle}
              primaryActionLabel={getPrimaryActionLabel(page.path)}
              onPrimaryAction={() => handlePrimaryAction(page.path)}
              {...shellProps}
            >
              {page.path === '/athletes/creer' ? (
                <CreateAthletePage />
              ) : page.path === '/tests-physiques/creer' ? (
                <CreatePhysicalTestPage />
              ) : (
                <PageView />
              )}
            </AppShell>
          }
        />
      ))}

      <Route path="*" element={<Navigate to="/connexion" replace />} />
    </Routes>
  )
}

export default App