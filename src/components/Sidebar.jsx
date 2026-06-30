import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
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

// Admin (1), Coach/Kin (2), Athlete (3)
const ALL_NAV_ITEMS = [
  { label: 'Tableau de bord', icon: HomeIcon, to: '/tableau-de-bord', allowedLevels: [1, 2] },
  { label: 'Athlètes', icon: UsersIcon, to: '/athletes', allowedLevels: [1, 2] },
  { label: 'Tests physiques', icon: PulseIcon, to: '/tests-physiques', allowedLevels: [1, 2] },
  { label: 'Résultats', icon: ChartIcon, to: '/resultats', allowedLevels: [1, 2, 3] },
  { label: 'Séances', icon: CalendarIcon, to: '/seances', allowedLevels: [1, 2, 3] },
  { label: 'Rapports', icon: FileIcon, to: '/rapports', allowedLevels: [1, 2, 3] },
]

export function Sidebar({ isOpen, onClose }) {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const navigationItems = ALL_NAV_ITEMS.filter((item) => 
    user && item.allowedLevels.includes(user.accessLevel)
  )

  const handleLogout = async (e) => {
    e.preventDefault()
    await logout()
  }

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
            {user && (
              <p className="text-xs text-gray-400 mt-1">
                {user.firstName} {user.lastName}
              </p>
            )}
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
        <button 
          onClick={handleLogout} 
          className="sidebar-nav__item sidebar-nav__item--muted"
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            font: 'inherit',
            cursor: 'pointer',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            textAlign: 'left'
          }}
        >
        <LogoutIcon />
        <span>Déconnexion</span>
      </button>
      </div>
    </aside>
  )
}