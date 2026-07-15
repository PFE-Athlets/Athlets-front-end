import { useState } from 'react'
import { Header } from './Header.jsx'
import { Sidebar } from './Sidebar.jsx'

export function AppShell({
  children,
  pageTitle,
  pageSubtitle,
  activeUserName,
  activeUserRole,
  activeUserId,
  notificationsCount = 0,
  onLogout,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="app-shell">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeUserRole={activeUserRole}
        activeUserId={activeUserId}
        onLogout={onLogout}
      />

      <div className="app-shell__main">
        <Header
          pageTitle={pageTitle}
          pageSubtitle={pageSubtitle}
          activeUserName={activeUserName}
          activeUserRole={activeUserRole}
          notificationsCount={notificationsCount}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <main className="app-shell__content">
          {children}
        </main>
      </div>
    </div>
  )
}