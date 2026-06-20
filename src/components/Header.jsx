import { BellIcon } from './Icons'

export function Header({
  pageTitle,
  pageSubtitle,
  activeUserName,
  activeUserRole,
  notificationsCount = 0,
}) {
  return (
    <header className="app-header">

      <div className="app-header__title-block">
        <div>
          <h1>{pageTitle}</h1>
        </div>

        <div className="header-controls">
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
            <span>{activeUserName}</span>
          </div>
        </div>
      </div>
    </header>
  )
}