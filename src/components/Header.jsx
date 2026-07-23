import { useAuthStore } from '../stores/authStore'
import { MenuIcon } from './Icons'

export function Header({ pageTitle, pageSubtitle, onMenuClick }) {
  const user = useAuthStore((state) => state.user)
  const activeUserName = user ? `${user.firstName} ${user.lastName}` : 'Utilisateur'

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : 'U'

  return (
    <header className="app-header">
      <div className="app-header__title-block">
        <div className="header-title-row">
          <button type="button" className="hamburger-btn" onClick={onMenuClick}>
            <MenuIcon />
          </button>
          <h1>{pageTitle}</h1>
          {pageSubtitle && <p className="header-subtitle">{pageSubtitle}</p>}
        </div>

        <div className="header-controls">
          <div className="profile-chip" aria-label={activeUserName}>
            <div className="avatar" aria-hidden="true">{initials}</div>
            <span className="profile-chip__name">{activeUserName}</span>
          </div>
        </div>
      </div>
    </header>
  )
}