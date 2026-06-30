import { useState } from 'react'
import { Header } from './Header.jsx'
import { Sidebar } from './Sidebar.jsx'

export function AppShell({
  children,
  pageTitle,
  pageSubtitle,
  activeUserName,
  activeUserRole,
  onLogout,
  notificationsCount = 0,
  primaryActionLabel,
  onPrimaryAction,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeUserRole={activeUserRole} onLogout={onLogout} />

      <div className="app-shell__main">
        <Header
          pageTitle={pageTitle}
          pageSubtitle={pageSubtitle}
          activeUserName={activeUserName}
          activeUserRole={activeUserRole}
          notificationsCount={notificationsCount}
          primaryActionLabel={primaryActionLabel}
          onPrimaryAction={onPrimaryAction}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="app-shell__content">{children}</main>
      </div>
    </div>
  )
}
