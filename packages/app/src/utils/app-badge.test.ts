import { describe, expect, test } from "bun:test"
import { countDistinctSessions } from "./app-badge"

describe("countDistinctSessions", () => {
  test("counts distinct sessions across servers", () => {
    expect(countDistinctSessions([["a", "b"], ["b", "c"]])).toBe(3)
  })

  test("returns zero when nothing is unseen", () => {
    expect(countDistinctSessions([[], []])).toBe(0)
  })
})
