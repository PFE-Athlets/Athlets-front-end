import { Header } from './Header.jsx'
import { Sidebar } from './Sidebar.jsx'

export function AppShell({
  children,
  pageTitle,
  pageSubtitle,
  activeUserName,
  activeUserRole,
  notificationsCount = 0,
  primaryActionLabel,
  onPrimaryAction,
}) {
  return (
    <div className="app-shell">
      <Sidebar />

      <div className="app-shell__main">
        <Header
          pageTitle={pageTitle}
          pageSubtitle={pageSubtitle}
          activeUserName={activeUserName}
          activeUserRole={activeUserRole}
          notificationsCount={notificationsCount}
          primaryActionLabel={primaryActionLabel}
          onPrimaryAction={onPrimaryAction}
        />

        <main className="app-shell__content">{children}</main>
      </div>
    </div>
  )
}