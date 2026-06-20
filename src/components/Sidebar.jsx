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
} from './Icons'

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
        <a href="/connection" className="sidebar-nav__item sidebar-nav__item--muted">
          <LogoutIcon />
          <span>Déconnexion</span>
        </a>
      </div>
    </aside>
  )
}