import { RouterProvider } from 'react-router-dom'
import { router } from './router/router'
import { Navigate } from 'react-router-dom'
import './App.css'

function ProtectedRoute({ currentUser, children }) {
  if (!currentUser) {
    return <Navigate to="/connection" replace />
  }
  return children
}

function App() {
  return <RouterProvider router={router} />
}

export default App