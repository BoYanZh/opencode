import { createEffect } from "solid-js"
import { useGlobal } from "@/context/global"
import { useNotification } from "@/context/notification"
import { usePermission } from "@/context/permission"
import { syncAppBadge } from "@/utils/app-badge"

export function AppBadgeSync() {
  const global = useGlobal()
  const notification = useNotification()
  const permission = usePermission()

  createEffect(() => {
    if (global.servers.list().length === 0) {
      syncAppBadge(0)
      return
    }
    const key = notification.selectedKey()
    const ids = new Set([...notification.session.unseenSessionIDs(), ...permission.attentionSessionIDs(key)])
    syncAppBadge(ids.size)
  })

  return null
}
