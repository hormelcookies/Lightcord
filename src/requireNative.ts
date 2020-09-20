import * as path from "path"

export default function requireNativeDiscordModule(id){
    let modulesPath: string
    if (process.env.NODE_THING){
        modulesPath = path.join(__dirname, "..", "workspace_modules", id)
    } else {
        modulesPath = path.join(__dirname, "..", "modules", id)
    }
    return require(modulesPath)
}