import { useState } from 'react'
import { Header } from './Header.jsx'
import { Sidebar } from './Sidebar.jsx'

export function AppShell({ children, pageTitle, pageSubtitle }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="app-shell__main">
        <Header
          pageTitle={pageTitle}
          pageSubtitle={pageSubtitle}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="app-shell__content">{children}</main>
      </div>
    </div>
  )
}