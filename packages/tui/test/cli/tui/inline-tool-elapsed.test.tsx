import { afterEach, describe, expect, test } from "bun:test"
import { testRender, type JSX } from "@opentui/solid"
import { RGBA } from "@opentui/core"
import { InlineToolRow } from "../../../src/routes/session"

const muted = RGBA.fromValues(128, 128, 128, 1)

let testSetup: Awaited<ReturnType<typeof testRender>> | undefined

afterEach(() => {
  testSetup?.renderer.destroy()
  testSetup = undefined
})

async function renderFrame(component: () => JSX.Element, options: { width: number; height: number }) {
  testSetup = await testRender(component, options)
  await testSetup.renderOnce()
  await testSetup.renderOnce()

  return testSetup
    .captureCharFrame()
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trimEnd()
}

describe("TUI inline tool elapsed badge", () => {
  test("shows the frozen total on completed tools", async () => {
    const frame = await renderFrame(
      () => (
        <InlineToolRow icon="→" complete="src/index.ts" pending="Reading file…" elapsed="· 3.2s" elapsedColor={muted}>
          Read src/index.ts
        </InlineToolRow>
      ),
      { width: 72, height: 3 },
    )
    expect(frame).toContain("Read src/index.ts")
    expect(frame).toContain("· 3.2s")
  })

  test("shows the live value on running tools", async () => {
    const frame = await renderFrame(
      () => (
        <InlineToolRow icon="$" complete={false} pending="Running command…" elapsed="· 12.0s" elapsedColor={muted}>
          {`sleep 20`}
        </InlineToolRow>
      ),
      { width: 72, height: 3 },
    )
    expect(frame).toContain("· 12.0s")
  })

  test("renders nothing extra when elapsed is absent", async () => {
    const frame = await renderFrame(
      () => (
        <InlineToolRow icon="→" complete="src/index.ts" pending="Reading file…">
          Read src/index.ts
        </InlineToolRow>
      ),
      { width: 72, height: 3 },
    )
    expect(frame).toContain("Read src/index.ts")
    expect(frame).not.toContain("·")
  })
})
