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
import ActivateAccountPage from './pages/ActivateAccountPage.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'

import AthletePageView from './pages/athletes/AthletePageView.jsx'
import CreateAthletePage from './pages/athletes/CreateAthletePage.jsx'
import EditAthletePage from './pages/athletes/EditAthletePage.jsx'
import AthleteDetailsPage from './pages/athletes/AthleteDetailsPage.jsx'

import PhysicalTestPageView from './pages/physical-test/PhysicalTestPageView.jsx'
import CreatePhysicalTestPage from './pages/physical-test/CreatePhysicalTestPage.jsx'
import PhysicalTestDetailsPage from './pages/physical-test/PhysicalTestDetailsPage.jsx'

import BatterieTestPageView from './pages/batterie-tests/BatterieTestPageView.jsx'
import CreateBatterieTestPage from './pages/batterie-tests/CreateBatterieTestPage.jsx'
import BatterieTestDetailsPage from './pages/batterie-tests/BatterieTestDetailsPage.jsx'
import EditBatterieTestPage from './pages/batterie-tests/EditBatterieTestPage.jsx'

import CreateTeamPage from './pages/teams/CreateTeamPage.jsx'
import EditTeamPage from './pages/teams/EditTeamPage.jsx'
import TeamPageView from './pages/teams/TeamPageView.jsx'
import TeamDetailsPage from './pages/teams/TeamDetailsPage.jsx'
import MyTeamsPage from './pages/teams/MyTeamsPage.jsx'

import CreateResultPage from './pages/results/CreateResultPage.jsx'
import CreateResultSingleAthletePage from './pages/results/CreateResultSingleAthletePage.jsx'
import CreateResultMultipleAthletesPage from './pages/results/CreateResultMultipleAthletesPage.jsx'
import ResultPageView from './pages/results/ResultPageView.jsx'
import ResultDetailsPage from './pages/results/ResultDetailPage.jsx'

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
    path: '/mes-equipes',
    title: 'Mes équipes',
    subtitle: 'Consultez les équipes auxquelles vous appartenez',
  },
  {
    path: '/equipes',
    title: 'Équipes',
    subtitle: 'Gestion de la liste des équipes',
  },
  {
    path: '/equipes/creer',
    title: 'Créer une équipe',
    subtitle: 'Création d’une nouvelle équipe',
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
    path: '/batterie-tests',
    title: 'Batteries de tests physiques',
    subtitle: 'Suivi des batteries de tests physiques',
  },
  {
    path: '/batterie-tests/creer',
    title: 'Créer une batterie de tests physiques',
    subtitle: 'Ajout d’une nouvelle batterie de tests physiques',
  },
  {
    path: '/resultats',
    title: 'Résultats des athlètes',
    subtitle: 'Suivi des résultats des athlètes',
  },
  {
    path: '/resultats/creer',
    title: 'Créer un résultat',
    subtitle: 'Création d’un nouveau résultat',
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
  Administrateur: '/athletes',
  Coach: '/athletes',
  Athlète: '/resultats',
  Kiné: '/equipes',
}

const ROLE_BY_ACCESS_LEVEL = {
  1: 'Administrateur',
  2: 'Coach',
  3: 'Athlète',
  4: 'Kiné',
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
      ] ?? 'Athlète'
    : 'Athlète'
  const canCreateTeam = activeUserRole === 'Administrateur'
  const canModifyTeam = activeUserRole === 'Administrateur' || activeUserRole === 'Coach'

  const handleLoginSuccess = (user) => {
    sessionStorage.setItem(
      'currentUser',
      JSON.stringify(user),
    )

    setCurrentUser(user)

    const role =
      ROLE_BY_ACCESS_LEVEL[
        user.accessLevel
      ] ?? 'Athlète'

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

      case '/mes-equipes':
        return (
          <MyTeamsPage/>
        )

      case '/equipes':
        return (
          <TeamPageView
            canCreateTeam={canCreateTeam}
            canModifyTeam={canModifyTeam}
          />
        )

      case '/equipes/creer':
        return (
          <CreateTeamPage
            canCreateTeam={canCreateTeam}
          />
        )

      case '/tests-physiques':
        return <PhysicalTestPageView />

      case '/tests-physiques/creer':
        return <CreatePhysicalTestPage />

      case '/batterie-tests':
        return <BatterieTestPageView />

      case '/batterie-tests/creer':
        return <CreateBatterieTestPage />

      case '/resultats':
        return <ResultPageView />

      case '/resultats/creer':
        return <CreateResultPage />

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

      <Route
        path="/activation-compte"
        element={<ActivateAccountPage />}
      />

      <Route
        path="/mot-de-passe-oublie"
        element={<ForgotPasswordPage />}
      />

      <Route
        path="/reinitialisation-mot-de-passe"
        element={<ResetPasswordPage />}
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
          <ProtectedRoute
            currentUser={currentUser}
          >
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
              pageTitle="Fiche de l’équipe"
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
            {canModifyTeam ? (
              <AppShell
                pageTitle="Modifier une équipe"
                pageSubtitle=""
                {...shellProps}
              >
                <EditTeamPage />
              </AppShell>
            ) : (
              <Navigate
                to="/equipes"
                replace
              />
            )}
          </ProtectedRoute>
        }
      />

      <Route
        path="/tests-physiques/:id"
        element={
          <ProtectedRoute
            currentUser={currentUser}
          >
            <AppShell
              pageTitle="Fiche du test physique"
              pageSubtitle=""
              {...shellProps}
            >
              <PhysicalTestDetailsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/batterie-tests/:id"
        element={
          <ProtectedRoute
            currentUser={currentUser}
          >
            <AppShell
              pageTitle="Détail de la batterie"
              pageSubtitle=""
              {...shellProps}
            >
              <BatterieTestDetailsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/batterie-tests/:id/modifier"
        element={
          <ProtectedRoute
            currentUser={currentUser}
          >
            <AppShell
              pageTitle="Modifier une batterie de tests"
              pageSubtitle="Modifiez les informations de la batterie et ajoutez de nouveaux tests si nécessaire."
              {...shellProps}
            >
              <EditBatterieTestPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/resultats/:id"
        element={
          <ProtectedRoute currentUser={currentUser}>
            <AppShell
              pageTitle="Détail du résultat"
              pageSubtitle=""
              {...shellProps}
            >
              <ResultDetailsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/resultats/creer/single"
        element={
          <ProtectedRoute currentUser={currentUser}>
            <AppShell
              pageTitle="Saisir un résultat"
              pageSubtitle=""
              {...shellProps}
            >
              <CreateResultSingleAthletePage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/resultats/creer/multiple"
        element={
          <ProtectedRoute currentUser={currentUser}>
            <AppShell
              pageTitle="Saisir des résultats"
              pageSubtitle=""
              {...shellProps}
            >
              <CreateResultMultipleAthletesPage />
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