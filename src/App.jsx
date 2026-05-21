import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { AppShell } from './components/AppShell.jsx'
import { PageView } from './pages/PageView.jsx'

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
    path: '/tests-physiques',
    title: 'Tests physiques',
    subtitle: 'Suivi des évaluations physiques',
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

  // hardcoded user info for demo purposes
  const shellProps = {
    activeUserName: 'Camille Tremblay',
    activeUserRole: 'Coach',
    notificationsCount: 2,
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/tableau-de-bord" replace />} />

      {pages.map((page) => (
        <Route
          key={page.path}
          path={page.path}
          element={
            <AppShell
              pageTitle={page.title}
              pageSubtitle={page.subtitle}
              primaryActionLabel={page.path === '/athletes' ? 'Créer un athlète' : undefined}
              {...shellProps}
            >
              <PageView />
            </AppShell>
          }
        />
      ))}

      <Route
        path="*"
        element={<Navigate to="/athletes" replace />}
      />
    </Routes>
  )
}

export default App
