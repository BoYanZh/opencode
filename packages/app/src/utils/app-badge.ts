declare global {
  interface Navigator {
    setAppBadge?: (contents?: number) => Promise<void>
    clearAppBadge?: () => Promise<void>
  }
}

export function supportsAppBadge() {
  return typeof navigator === "object" && typeof navigator.setAppBadge === "function"
}

export function countDistinctSessions(idsPerServer: string[][]) {
  return new Set(idsPerServer.flat()).size
}

export function syncAppBadge(count: number) {
  if (!supportsAppBadge()) return
  if (count > 0) {
    void navigator.setAppBadge?.(Math.floor(count))?.catch(() => {})
    return
  }
  if (typeof navigator.clearAppBadge === "function") {
    void navigator.clearAppBadge()?.catch(() => {})
    return
  }
  void navigator.setAppBadge?.(0)?.catch(() => {})
}
