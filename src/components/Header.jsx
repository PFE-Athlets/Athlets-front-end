import { BellIcon, MenuIcon } from './Icons'

const ROLES = ['Coach', 'Kinésiologue', 'Athlète', 'Administrateur']

export function Header({
  pageTitle,
  pageSubtitle,
  activeUserName,
  activeUserRole,
  onRoleChange,
  notificationsCount = 0,
  onMenuClick,
}) {
  return (
    <header className="app-header">
      <div className="app-header__title-block">
        <div className="header-title-row">
          <button
            type="button"
            className="hamburger-btn"
            onClick={onMenuClick}
            aria-label="Ouvrir le menu"
          >
            <MenuIcon />
          </button>
          <h1>{pageTitle}</h1>
        </div>

        <div className="header-controls">
          <label className="dev-role-toggle" title="Toggle de développement — simuler un rôle">
            <span>DEV</span>
            <select value={activeUserRole} onChange={(e) => onRoleChange(e.target.value)}>
              {ROLES.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </label>

          <button type="button" className="icon-button" aria-label={`Notifications ${notificationsCount}`}>
            <BellIcon />
            {notificationsCount > 0 ? <span className="badge">{notificationsCount}</span> : null}
          </button>

          <div className="profile-chip" aria-label={activeUserName}>
            <div className="avatar" aria-hidden="true">
              {activeUserName
                .split(' ')
                .slice(0, 2)
                .map((part) => part[0])
                .join('')}
            </div>
            <span className="profile-chip__name">{activeUserName}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
