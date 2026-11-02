import { createEffect, createMemo, onCleanup } from "solid-js"
import { useGlobal } from "@/runtime/server/runtime"
import { ServerConnection, useServers } from "@/runtime/server/registry"
import { usePlatform } from "@/runtime/platform/platform"
import { useLayout } from "@/shell/state/layout"
import { useTabs } from "@/shell/tabs/tabs"
import { projectSettingsKey, useSettings } from "@/settings/model"
import { sessionRequests } from "@/shell/layout/project-avatar-state"

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
  const settings = useSettings()

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

  // Load every root session so the badge counts work waiting in sessions this client hasn't opened.
  createEffect(() => {
    const conn = server()
    const ctx = conn ? global.serverCtx(ServerConnection.key(conn)) : undefined

    if (ctx?.sdk.connection.status() !== "connected") return
    void syncRoots(ctx).catch(() => {})
  })

  const count = createMemo(() => {
    const conn = server()
    const ctx = conn ? global.serverCtx(ServerConnection.key(conn)) : undefined
    const data = ctx?.data

    if (!data) return 0

    return data.session
      .list()
      .filter((session) => !session.parentID && session.time.archived === undefined)
      .filter((root) => {
        if (ctx.notification.session.unread(root.id)) return true
        const project = projectSettingsKey(ctx.sdk.scope, root.projectID)
        const requests = sessionRequests(data, root.id, true, settings.permissions.autoApproves(project))

        return requests.permission || requests.form
      }).length
  })

  createEffect(() => {
    const value = count()

    void (value ? badge.setAppBadge(value) : badge.clearAppBadge()).catch(() => {})
  })

  onCleanup(() => {
    void badge.clearAppBadge().catch(() => {})
  })

  return null
}

async function syncRoots(ctx: Exclude<ReturnType<ReturnType<typeof useGlobal>["serverCtx"]>, undefined>) {
  let cursor: string | undefined

  for (;;) {
    const page = await ctx.sdk.api.session.list({ limit: 200, order: "desc", parentID: null, cursor })

    page.data.forEach((session) => ctx.data.session.remember(session))
    if (page.data.length === 0 || !page.cursor.next) return
    cursor = page.cursor.next
  }
}
