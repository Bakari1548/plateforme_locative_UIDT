import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { Bell, CheckCheck, Inbox } from 'lucide-react'

const TYPE_ICONS = {
  demande: '📋',
  decision: '⚖️',
  systeme: '🔔',
  contrat: '📝',
  paiement: '💰',
  incident: '⚠️',
  transfert: '🔄',
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { loadNotifications() }, [])

  async function loadNotifications() {
    setLoading(true)
    setError('')
    const result = await api.notifications.list()
    if (result.error) {
      setError(result.error)
    } else {
      setNotifications(result.notifications || [])
    }
    setLoading(false)
  }

  async function handleMarkAsRead(id) {
    const result = await api.notifications.markAsRead(id)
    if (!result.error) {
      setNotifications(notifications.map(n => n.id === id ? { ...n, lu: true } : n))
    }
  }

  async function handleMarkAllRead() {
    const result = await api.notifications.markAllAsRead()
    if (!result.error) {
      setNotifications(notifications.map(n => ({ ...n, lu: true })))
    }
  }

  const unreadCount = notifications.filter(n => !n.lu).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-accent-dark mb-1">Notifications</h1>
          <p className="text-sm text-accent-slate">
            {unreadCount > 0 ? `${unreadCount} notification(s) non lue(s)` : 'Toutes les notifications sont lues'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 bg-primary-700 text-white text-sm rounded-lg hover:bg-primary-800 flex items-center gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            Tout marquer comme lu
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-accent-red px-4 py-3 rounded-lg">{error}</div>
      )}

      {loading ? (
        <div className="bg-white shadow-sm rounded-lg p-8 text-center text-accent-slate">Chargement...</div>
      ) : notifications.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg p-8 text-center">
          <Inbox className="h-12 w-12 text-accent-light mx-auto mb-3" />
          <p className="text-accent-slate">Aucune notification</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`bg-white shadow-sm rounded-lg p-5 flex items-start gap-4 ${
                !n.lu ? 'border-l-4 border-primary-700' : ''
              }`}
            >
              <div className="text-2xl flex-shrink-0">
                {TYPE_ICONS[n.type] || '🔔'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-accent-dark">{n.titre}</p>
                  {!n.lu && (
                    <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full font-medium">Nouveau</span>
                  )}
                </div>
                <p className="text-sm text-accent-slate">{n.message}</p>
                <p className="text-xs text-accent-light mt-1">
                  {new Date(n.created_at).toLocaleString('fr-FR')}
                </p>
              </div>
              {!n.lu && (
                <button
                  onClick={() => handleMarkAsRead(n.id)}
                  className="text-xs text-primary-700 hover:underline flex-shrink-0"
                >
                  Marquer comme lu
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
