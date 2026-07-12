import { useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import './App.css'
import { AppShell } from './components/AppShell.jsx'
import { PageView } from './pages/PageView.jsx'
import LoginPage from './pages/LoginPage.jsx'
import AthletePageView from './pages/athletes/AthletePageView.jsx'
import PhysicalTestPageView from './pages/physical-test/PhysicalTestPageView.jsx'
import CreateAthletePage from './pages/athletes/CreateAthletePage.jsx'
import CreatePhysicalTestPage from './pages/physical-test/CreatePhysicalTestPage.jsx'
import CreateTeamPage from './pages/teams/CreateTeamPage.jsx'
import EditTeamPage from './pages/teams/EditTeamPage.jsx'
import TeamPageView from './pages/teams/TeamPageView.jsx'
import TeamDetailsPage from './pages/teams/TeamDetailsPage.jsx'

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
    primaryActionLabel: 'Créer un athlète',
    primaryActionPath: '/athletes/creer',
  },
  {
    path: '/equipes',
    title: 'Équipes',
    subtitle: '',
  },
  {
    path: '/equipes/creer',
    title: 'Créer une équipe',
    subtitle: '',
  },
  {
    path: '/athletes/creer',
    title: 'Créer un athlète',
    subtitle: 'Ajout d’un nouvel athlète',
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
    primaryActionLabel: 'Créer un test physique',
    primaryActionPath: '/tests-physiques/creer',
  },
  {
    path: '/tests-physiques/creer',
    title: 'Créer un test physique',
    subtitle: 'Ajout d’un nouveau test physique',
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

function ProtectedRoute({ currentUser, children }) {
  if (!currentUser) {
    return <Navigate to="/connection" replace />
  }
  return children
}

const HOME_BY_ROLE = {
  'Administrateur': '/tableau-de-bord',
  'Coach': '/athletes',
  'Athlète': '/resultats',
}

const ROLE_BY_ACCESS_LEVEL = {
  1: 'Administrateur',
  2: 'Coach',
  3: 'Athlète',
}

function App() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = sessionStorage.getItem('currentUser')
    return stored ? JSON.parse(stored) : null
  })

  const activeUserRole = currentUser
    ? (ROLE_BY_ACCESS_LEVEL[currentUser.accessLevel] ?? 'Coach')
    : 'Coach'

  const handleLoginSuccess = (user) => {
    sessionStorage.setItem('currentUser', JSON.stringify(user))
    setCurrentUser(user)
    const role = ROLE_BY_ACCESS_LEVEL[user.accessLevel] ?? 'Coach'
    navigate(HOME_BY_ROLE[role] ?? '/tableau-de-bord')
  }

  const handleLogout = () => {
    sessionStorage.removeItem('currentUser')
    setCurrentUser(null)
    navigate('/connection')
  }

  const shellProps = {
    activeUserName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : '—',
    activeUserRole,
    onLogout: handleLogout,
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
      <Route path="/" element={<Navigate to="/connection" replace />} />
      <Route path="/connection" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />

      {pages.map((page) => (
        <Route
          key={page.path}
          path={page.path}
          element={
            <ProtectedRoute currentUser={currentUser}>
            <AppShell
              pageTitle={page.title}
              pageSubtitle={page.subtitle}
              {...shellProps}
            >
              {page.path === '/athletes' ? (
                <AthletePageView />
              ) : page.path === '/equipes' ? (
                <TeamPageView />
              ) : page.path === '/equipes/creer' ? (
                <CreateTeamPage />
              ) : page.path === '/tests-physiques' ? (
                <PhysicalTestPageView />
              ) : page.path === '/athletes/creer' ? (
                <CreateAthletePage />
              ) : page.path === '/tests-physiques/creer' ? (
                <CreatePhysicalTestPage />
              ) : (
                <PageView />
              )}
            </AppShell>
            </ProtectedRoute>
          }
        />
      ))}

      <Route
        path="/equipes/:teamId"
        element={
          <ProtectedRoute currentUser={currentUser}>
            <AppShell
              pageTitle="Fiche de l'équipe"
              pageSubtitle=""
              {...shellProps}
            >
              <TeamDetailsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/equipes/:teamId/modifier"
        element={
          <ProtectedRoute currentUser={currentUser}>
            <AppShell
              pageTitle="Modifier une équipe"
              pageSubtitle=""
              {...shellProps}
            >
              <EditTeamPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/connection" replace />} />
    </Routes>
  )
}

export default App