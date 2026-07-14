import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore.js'
import LoginPage from '../pages/LoginPage.jsx'
import { AppShell } from '../components/AppShell.jsx'
import { PageView } from '../pages/PageView.jsx'
import AthletePageView from '../pages/athletes/AthletePageView.jsx'
import PhysicalTestPageView from '../pages/physical-test/PhysicalTestPageView.jsx'
import CreateAthletePage from '../pages/athletes/CreateAthletePage.jsx'
import CreatePhysicalTestPage from '../pages/physical-test/CreatePhysicalTestPage.jsx'
import { ResultsDashboard } from '../pages/ResultPage.jsx'

const PAGE_META = {
  '/tableau-de-bord': { title: 'Tableau de bord', subtitle: 'Vue globale de l’activité du club' },
  '/athletes': { title: 'Athlètes', subtitle: 'Gestion de la liste des athlètes' },
  '/athletes/creer': { title: 'Créer un athlète', subtitle: 'Ajout d’un nouvel athlète' },
  '/tests-physiques': { title: 'Tests physiques', subtitle: 'Suivi des évaluations physiques' },
  '/tests-physiques/creer': { title: 'Créer un test physique', subtitle: 'Ajout d’un nouveau test physique' },
  '/resultats': { title: 'Résultats', subtitle: 'Analyse et comparaison des performances' },
  '/seances': { title: 'Séances', subtitle: 'Planning et historique des séances' },
  '/rapports': { title: 'Rapports', subtitle: 'Export et synthèse des données' },
  '/parametres': { title: 'Paramètres', subtitle: 'Réglages de l’application' },
}

const ProtectedLayout = ({ allowedLevels }) => {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/connection" replace />
  }

  if (allowedLevels && !allowedLevels.includes(user?.accessLevel)) {
    return <Navigate to="/tableau-de-bord" replace />
  }

  const currentMeta = PAGE_META[location.pathname] || { title: 'Application', subtitle: '' }

  return (
    <AppShell 
      pageTitle={currentMeta.title} 
      pageSubtitle={currentMeta.subtitle}
      notificationsCount={2}
    >
      <Outlet />
    </AppShell>
  )
}

const RootRedirector = () => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) return <Navigate to="/connection" replace />

  if (user?.accessLevel === 1) return <Navigate to="/tableau-de-bord" replace />
  if (user?.accessLevel === 2) return <Navigate to="/athletes" replace />
  if (user?.accessLevel === 3) return <Navigate to="/resultats" replace />

  return <Navigate to="/resultats" replace />
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirector />,
  },
  {
    path: '/connection',
    element: <LoginPage />,
  },

  {
    element: <ProtectedLayout allowedLevels={[1, 2, 3]} />,
    children: [
      { path: '/resultats', element: <ResultsDashboard /> },
      { path: '/seances', element: <PageView /> },
      { path: '/rapports', element: <PageView /> },
      { path: '/parametres', element: <PageView /> },
    ],
  },

  {
    element: <ProtectedLayout allowedLevels={[1, 2]} />,
    children: [
      { path: '/tableau-de-bord', element: <PageView /> },
      { path: '/athletes', element: <AthletePageView /> },
      { path: '/athletes/creer', element: <CreateAthletePage /> },
      { path: '/tests-physiques', element: <PhysicalTestPageView /> },
      { path: '/tests-physiques/creer', element: <CreatePhysicalTestPage /> },
    ],
  },

  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])