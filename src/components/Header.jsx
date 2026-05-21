function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M10.5 4a6.5 6.5 0 1 0 4.13 11.53l4.42 4.42 1.41-1.41-4.42-4.42A6.5 6.5 0 0 0 10.5 4Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3a5 5 0 0 0-5 5v2.1c0 .9-.27 1.77-.78 2.5L4.6 15.1a1 1 0 0 0 .82 1.57h12.16a1 1 0 0 0 .82-1.57l-1.62-2.5a4.1 4.1 0 0 1-.78-2.5V8a5 5 0 0 0-5-5Zm0 18a2.5 2.5 0 0 0 2.35-1.65h-4.7A2.5 2.5 0 0 0 12 21Z" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M11 5h2v14h-2z" />
      <path d="M5 11h14v2H5z" />
    </svg>
  )
}

export function Header({
  pageTitle,
  pageSubtitle,
  activeUserName,
  activeUserRole,
  notificationsCount = 0,
  primaryActionLabel,
  onPrimaryAction,
}) {
  return (
    <header className="app-header">

      <div className="app-header__title-block">
        <div>
          <p className="page-kicker">{activeUserRole}</p>
          <h1>{pageTitle}</h1>
          <p className="page-subtitle">{pageSubtitle}</p>
        </div>

        <div className="header-controls">
          <button type="button" className="date-filter" aria-label="Changer la période">
            1 - 31 mai 2024
          </button>

          <label className="search-field" aria-label="Rechercher">
            <SearchIcon />
            <input type="search" placeholder="Rechercher..." />
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
            <span>{activeUserName}</span>
          </div>

          <button type="button" className="primary-action" onClick={onPrimaryAction}>
            <PlusIcon />
            <span>{primaryActionLabel}</span>
          </button>
        </div>
      </div>
    </header>
  )
}