import { describe, expect, test } from "bun:test"
import { nextPromptID } from "./fork-boundary"

const transcript = [
  { id: "msg_1", type: "user" },
  { id: "msg_2", type: "assistant" },
  { id: "msg_3", type: "idle" },
  { id: "msg_4", type: "user" },
  { id: "msg_5", type: "assistant" },
]

describe("nextPromptID", () => {
  test("a reply cuts before the next prompt, across the turn's other rows", () => {
    expect(nextPromptID(transcript, "msg_2")).toBe("msg_4")
  })

  test("the last reply keeps the whole transcript", () => {
    expect(nextPromptID(transcript, "msg_5")).toBeUndefined()
  })

  test("a message outside the loaded page keeps the whole transcript", () => {
    expect(nextPromptID(transcript, "msg_404")).toBeUndefined()
  })
})
