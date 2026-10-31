import { createEffect, createMemo, onCleanup } from "solid-js"
import { useGlobal } from "@/runtime/server/runtime"
import { ServerConnection, useServers } from "@/runtime/server/registry"
import { usePlatform } from "@/runtime/platform/platform"
import { useLayout } from "@/shell/state/layout"
import { useTabs } from "@/shell/tabs/tabs"

type AppBadgeNavigator = Navigator & {
  setAppBadge: (count?: number) => Promise<void>
  clearAppBadge: () => Promise<void>
}

function supportsAppBadge(value: Navigator): value is AppBadgeNavigator {
  return (
    "setAppBadge" in value &&
    typeof value.setAppBadge === "function" &&
    "clearAppBadge" in value &&
    typeof value.clearAppBadge === "function"
  )
}

export function AppBadge() {
  const platform = usePlatform()
  if (platform.platform !== "web" || !supportsAppBadge(navigator)) return null
  const badge = navigator
  const global = useGlobal()
  const servers = useServers()
  const layout = useLayout()
  const tabs = useTabs()
  const server = createMemo(() => {
    const route = layout.route()
    const key =
      route.type === "session"
        ? route.server
        : route.type === "draft"
          ? tabs.store.find((tab) => tab.type === "draft" && tab.draftID === route.draftID)?.server
          : layout.home.selection().server

    return servers.visible.find((conn) => ServerConnection.key(conn) === key) ?? servers.visible[0]
  })

  createEffect(() => {
    const conn = server()
    const ctx = conn ? global.serverCtx(ServerConnection.key(conn)) : undefined

    if (ctx?.sdk.connection.status() === "connected") void ctx.notification.syncAttention().catch(() => {})
  })

  createEffect(() => {
    const conn = server()
    const ctx = conn ? global.serverCtx(ServerConnection.key(conn)) : undefined

    const count = ctx?.notification.attention().length ?? 0
    void (count ? badge.setAppBadge(count) : badge.clearAppBadge()).catch(() => {})
  })

  onCleanup(() => {
    void badge.clearAppBadge().catch(() => {})
  })

  return null
}
