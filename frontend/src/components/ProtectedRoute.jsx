import { Navigate } from 'react-router-dom'
import { getCurrentUser } from '../lib/api'

export default function ProtectedRoute({ children, roles }) {
  const user = getCurrentUser()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
