import { NavLink } from 'react-router-dom'
import logo from '../assets/283808481.png'
import {
  HomeIcon,
  UsersIcon,
  PulseIcon,
  ChartIcon,
  CalendarIcon,
  FileIcon,
  SettingsIcon,
  LogoutIcon,
  XIcon,
} from './Icons'

const ALL_NAV_ITEMS = [
  { label: 'Tableau de bord', icon: HomeIcon, to: '/tableau-de-bord', roles: ['Coach', 'Kinésiologue', 'Administrateur'] },
  { label: 'Athlètes', icon: UsersIcon, to: '/athletes', roles: ['Coach', 'Kinésiologue', 'Administrateur'] },
  { label: 'Tests physiques', icon: PulseIcon, to: '/tests-physiques', roles: ['Coach', 'Kinésiologue', 'Administrateur'] },
  { label: 'Résultats', icon: ChartIcon, to: '/resultats', roles: ['Coach', 'Kinésiologue', 'Administrateur', 'Athlète'] },
  { label: 'Séances', icon: CalendarIcon, to: '/seances', roles: ['Coach', 'Kinésiologue', 'Administrateur', 'Athlète'] },
  { label: 'Rapports', icon: FileIcon, to: '/rapports', roles: ['Coach', 'Kinésiologue', 'Administrateur', 'Athlète'] },
]

export function Sidebar({ isOpen, onClose, activeUserRole }) {
  const navigationItems = ALL_NAV_ITEMS.filter((item) => item.roles.includes(activeUserRole))
  return (
    <aside className={`app-sidebar${isOpen ? ' is-open' : ''}`}>
      <div>
        <div className="app-sidebar__brand">
          <div className="sidebar-logo" aria-hidden="true">
            <img src={logo} alt="Athlets" className="sidebar-logo__img" />
          </div>
          <div>
            <p className="sidebar-title">Athlets</p>
            <p className="sidebar-subtitle">Gestion sportive</p>
          </div>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Fermer le menu"
          >
            <XIcon />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Navigation principale">
          {navigationItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.label}
                to={item.to}
                onClick={onClose}
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
        <NavLink
          to="/parametres"
          onClick={onClose}
          className="sidebar-nav__item sidebar-nav__item--muted"
        >
          <SettingsIcon />
          <span>Paramètres</span>
        </NavLink>
        <a href="/connection" className="sidebar-nav__item sidebar-nav__item--muted">
          <LogoutIcon />
          <span>Déconnexion</span>
        </a>
      </div>
    </aside>
  )
}
