/** What a fork boundary needs from a transcript row. */
type ForkableMessage = { readonly id: string; readonly type: string }

/**
 * The prompt a fork from an assistant message cuts before: the reply's own turn stays, and everything from the next
 * prompt on is dropped. `undefined` keeps the whole transcript, for a reply with no later prompt.
 */
export function nextPromptID(messages: readonly ForkableMessage[], messageID: string) {
  const index = messages.findIndex((message) => message.id === messageID)

  if (index < 0) return undefined

  return messages.slice(index + 1).find((message) => message.type === "user")?.id
}
