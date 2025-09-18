import { useKV } from '@github/spark/hooks'
import type { Notification } from '@/types/orders'

export function useNotifications() {
    const [notifications, setNotifications] = useKV<Notification[]>('notifications', [])

    const addNotification = (notification: Notification) => {
        setNotifications([notification, ...(notifications ?? [])])
    }

    const markAllAsRead = () => {
        setNotifications((notifications ?? []).map(n => ({ ...n, isRead: true })))
    }

    const unreadCount = (notifications ?? []).filter(n => !n.isRead).length

    return {
        notifications: notifications ?? [],
        addNotification,
        markAllAsRead,
        unreadCount,
    }
}
