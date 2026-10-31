import { Schema } from "effect"
import { SessionSchema } from "../session/schema.js"

export const RecoverySchema = Schema.Union([
  Schema.Struct({
    kind: Schema.Literal("shell"),
    sessionID: SessionSchema.ID,
    shellID: Schema.String,
    command: Schema.String,
    // Working directory the command ran in. Optional so records written
    // before this field existed still decode.
    cwd: Schema.optionalKey(Schema.String),
    // Opt-in re-spawn after a server restart. Only set for idempotent
    // commands that are safe to run twice.
    respawn: Schema.optionalKey(Schema.Boolean),
  }),
  Schema.Struct({
    kind: Schema.Literal("subagent"),
    parentSessionID: SessionSchema.ID,
    childSessionID: SessionSchema.ID,
    agent: Schema.String,
    description: Schema.String,
  }),
  Schema.Struct({
    kind: Schema.Literal("image"),
    sessionID: SessionSchema.ID,
    path: Schema.String,
    model: Schema.String,
  }),
])

export type Recovery = typeof RecoverySchema.Type
