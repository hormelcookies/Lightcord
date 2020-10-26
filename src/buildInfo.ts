import { getCommitID } from "./common/git"
const pak = require("../package.json")

export const releaseChannel:"stable"|"canary"|"ptb"|"development" = "stable"
export const version = "0.0.308"
export const commit = getCommitID()
export const NODE_ENV = process.env.NODE_ENV || undefined

export default {
    releaseChannel,
    version,
    commit,
    NODE_ENV
}

global["BuildInfo"] = {
    releaseChannel,
    version: pak.version,
    commit,
    NODE_ENV
}