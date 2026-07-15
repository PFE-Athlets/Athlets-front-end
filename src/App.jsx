import { useState } from 'react'
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom'

import './App.css'

import { AppShell } from './components/AppShell.jsx'
import { PageView } from './pages/PageView.jsx'
import LoginPage from './pages/LoginPage.jsx'

import AthletePageView from './pages/athletes/AthletePageView.jsx'
import CreateAthletePage from './pages/athletes/CreateAthletePage.jsx'
import EditAthletePage from './pages/athletes/EditAthletePage.jsx'
import AthleteDetailsPage from './pages/athletes/AthleteDetailsPage.jsx'

import PhysicalTestPageView from './pages/physical-test/PhysicalTestPageView.jsx'
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
  },
  {
    path: '/athletes/creer',
    title: 'Créer un athlète',
    subtitle: 'Ajout d’un nouvel athlète',
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

function ProtectedRoute({
  currentUser,
  children,
}) {
  if (!currentUser) {
    return (
      <Navigate
        to="/connection"
        replace
      />
    )
  }

  return children
}

const HOME_BY_ROLE = {
  Administrateur: '/tableau-de-bord',
  Coach: '/athletes',
  Athlète: '/resultats',
}

const ROLE_BY_ACCESS_LEVEL = {
  1: 'Administrateur',
  2: 'Coach',
  3: 'Athlète',
}

function App() {
  const navigate = useNavigate()

  const [currentUser, setCurrentUser] =
    useState(() => {
      const stored =
        sessionStorage.getItem('currentUser')

      return stored
        ? JSON.parse(stored)
        : null
    })

  const activeUserRole = currentUser
    ? ROLE_BY_ACCESS_LEVEL[
        currentUser.accessLevel
      ] ?? 'Coach'
    : 'Coach'

  const canCreateTeam =
    activeUserRole === 'Administrateur'

  const handleLoginSuccess = (user) => {
    sessionStorage.setItem(
      'currentUser',
      JSON.stringify(user),
    )

    setCurrentUser(user)

    const role =
      ROLE_BY_ACCESS_LEVEL[
        user.accessLevel
      ] ?? 'Coach'

    navigate(
      HOME_BY_ROLE[role] ??
        '/tableau-de-bord',
    )
  }

  const handleLogout = async () => {
    try {
      await fetch(
        'http://localhost:8080/api/auth/logout',
        {
          method: 'POST',
          credentials: 'include',
        },
      )
    } catch (error) {
      console.error(
        'Erreur lors de la déconnexion :',
        error,
      )
    } finally {
      sessionStorage.removeItem(
        'currentUser',
      )

      setCurrentUser(null)
      navigate('/connection')
    }
  }

  const shellProps = {
    activeUserName: currentUser
      ? `${currentUser.firstName} ${currentUser.lastName}`
      : '—',
    activeUserRole,
    activeUserId: currentUser?.id,
    onLogout: handleLogout,
    notificationsCount: 2,
  }

  const renderPageContent = (path) => {
    switch (path) {
      case '/athletes':
        return <AthletePageView />

      case '/athletes/creer':
        return <CreateAthletePage />

      case '/equipes':
        return (
          <TeamPageView
            canCreateTeam={canCreateTeam}
          />
        )

      case '/equipes/creer':
        return canCreateTeam ? (
          <CreateTeamPage />
        ) : (
          <Navigate
            to="/equipes"
            replace
          />
        )

      case '/tests-physiques':
        return <PhysicalTestPageView />

      case '/tests-physiques/creer':
        return <CreatePhysicalTestPage />

      default:
        return <PageView />
    }
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to="/connection"
            replace
          />
        }
      />

      <Route
        path="/connection"
        element={
          <LoginPage
            onLoginSuccess={
              handleLoginSuccess
            }
          />
        }
      />

      {pages.map((page) => (
        <Route
          key={page.path}
          path={page.path}
          element={
            <ProtectedRoute
              currentUser={currentUser}
            >
              <AppShell
                pageTitle={page.title}
                pageSubtitle={page.subtitle}
                {...shellProps}
              >
                {renderPageContent(
                  page.path,
                )}
              </AppShell>
            </ProtectedRoute>
          }
        />
      ))}

      <Route
        path="/athletes/:id/modifier"
        element={
          <ProtectedRoute
            currentUser={currentUser}
          >
            <AppShell
              pageTitle="Modifier un athlète"
              pageSubtitle="Mise à jour du profil athlète"
              {...shellProps}
            >
              <EditAthletePage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/athletes/:id"
        element={
          <ProtectedRoute currentUser={currentUser}>
            <AppShell
              pageTitle="Profil de l’athlète"
              pageSubtitle=""
              {...shellProps}
            >
              <AthleteDetailsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/equipes/:teamId"
        element={
          <ProtectedRoute
            currentUser={currentUser}
          >
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
          <ProtectedRoute
            currentUser={currentUser}
          >
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

      <Route
        path="*"
        element={
          <Navigate
            to="/connection"
            replace
          />
        }
      />
    </Routes>
  )
}

export default App