import { createEffect } from "solid-js"
import { useGlobal } from "@/context/global"
import { useNotification } from "@/context/notification"
import { syncAppBadge } from "@/utils/app-badge"

export function AppBadgeSync() {
  const global = useGlobal()
  const notification = useNotification()

  createEffect(() => {
    if (global.servers.list().length === 0) {
      syncAppBadge(0)
      return
    }
    syncAppBadge(notification.session.unseenSessionIDs().length)
  })

  return null
}
