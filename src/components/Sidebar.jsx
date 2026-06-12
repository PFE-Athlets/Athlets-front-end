import { NavLink } from 'react-router-dom'
import logo from '../assets/283808481.png'

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3 3 10v11h7v-7h4v7h7V10Zm7 16h-3v-7H8v7H5v-8.53l7-5.47 7 5.47Z" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M16 11a4 4 0 1 0-3.2-6.4A4 4 0 0 0 16 11Zm-8 0a3.5 3.5 0 1 0-2.8-5.6A3.5 3.5 0 0 0 8 11Zm8 2c-3.33 0-6 1.79-6 4v2h12v-2c0-2.21-2.67-4-6-4Zm-8 0c-.32 0-.63.02-.93.06C4.27 13.48 2 15.18 2 17v2h4v-2c0-1.2.42-2.3 1.13-3.21-.37-.03-.76-.05-1.13-.05Z" />
    </svg>
  )
}

function PulseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 13h4l2-5 3 11 2-6h5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 19h16v2H2V3h2Zm4-2h2V9H8Zm5 0h2V5h-2Zm5 0h2v-7h-2Z" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M7 2h2v2h6V2h2v2h3v18H4V4h3Zm13 6H4v12h16ZM6 8h12v2H6Z" />
    </svg>
  )
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Zm0 2.83L18.17 9H14ZM6 4h6v7h6v9H6Z" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m19.14 12.94.06-.94-.06-.94 2.11-1.65-2-3.46-2.54.83-.82-.48-.54-2.64H9.65l-.54 2.64-.82.48-2.54-.83-2 3.46 2.11 1.65-.06.94.06.94-2.11 1.65 2 3.46 2.54-.83.82.48.54 2.64h5.96l.54-2.64.82-.48 2.54.83 2-3.46Zm-7.14 3.06a4 4 0 1 1 4-4 4 4 0 0 1-4 4Z" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M10 17v-2h4v-2h-4V11l-4 3 4 3Zm9-13H8a2 2 0 0 0-2 2v4h2V6h11v12H8v-4H6v4a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" />
    </svg>
  )
}

const navigationItems = [
  { label: 'Tableau de bord', icon: HomeIcon, to: '/tableau-de-bord' },
  { label: 'Athlètes', icon: UsersIcon, to: '/athletes' },
  { label: 'Tests physiques', icon: PulseIcon, to: '/tests-physiques' },
  { label: 'Résultats', icon: ChartIcon, to: '/resultats' },
  { label: 'Séances', icon: CalendarIcon, to: '/seances' },
  { label: 'Rapports', icon: FileIcon, to: '/rapports' },
]

export function Sidebar() {
  return (
    <aside className="app-sidebar">
      <div>
        <div className="app-sidebar__brand">
          <div className="sidebar-logo" aria-hidden="true">
            <img src={logo} alt="Athlets" className="sidebar-logo__img" />
          </div>
          <div>
            <p className="sidebar-title">Athlets</p>
            <p className="sidebar-subtitle">Gestion sportive</p>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Navigation principale">
          {navigationItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `sidebar-nav__item${isActive ? ' is-active' : ''}`
                }
              >
                <Icon />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>

      <div className="sidebar-footer">
        <NavLink to="/parametres" className="sidebar-nav__item sidebar-nav__item--muted">
          <SettingsIcon />
          <span>Paramètres</span>
        </NavLink>
        <a href="/connexion" className="sidebar-nav__item sidebar-nav__item--muted">
          <LogoutIcon />
          <span>Déconnexion</span>
        </a>
      </div>
    </aside>
  )
}