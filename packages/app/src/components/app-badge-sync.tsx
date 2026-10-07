import { createEffect } from "solid-js"
import { useGlobal } from "@/context/global"
import { useNotification } from "@/context/notification"
import { ServerConnection } from "@/context/server"
import { countDistinctSessions, syncAppBadge } from "@/utils/app-badge"

export function AppBadgeSync() {
  const global = useGlobal()
  const notification = useNotification()

  createEffect(() => {
    const idsPerServer = global.servers
      .list()
      .map((conn) => notification.ensureServerState(ServerConnection.key(conn)).session.unseenSessionIDs())
    syncAppBadge(countDistinctSessions(idsPerServer))
  })

  return null
}
