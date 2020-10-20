//require('dotenv').config()
const { join } = require("path")
const PROJECT_DIRNAME=join(__dirname, "..")
const child_process = require("child_process")

let env = process.env

function spawnProcess(cmd, ...args) {
    const postfix = cmd === "node" ? ".exe" : ".cmd"
    cmd = process.platform === "win32" ? cmd + postfix : cmd
    let result = child_process.spawnSync(cmd, args, {
        cwd: PROJECT_DIRNAME,
        env: env,
        stdio: "inherit"
    })
    if (result.error){
        console.error("error!")
        console.error(result)
        console.error(result.stderr)
        process.exit(1)
    }
}

let result;
if (process.platform === "win32"){
    env.NPM_CONFIG_ELECTRON_MIRROR = "https://github.com/hormelcookies/supercoolrepo/releases/download/" 
    result = spawnProcess("npm", "i", "--save-dev", "--arch=ia32", "electron@9.3.1")
} else {
    result = spawnProcess("npm", "i", "--save-dev", "--arch=x64", "electron@9.3.1")
}

spawnProcess("node", join(PROJECT_DIRNAME,"installSubModules.js"))

console.log("Everything is installed. You should be able to do `npm test` to compile everything and launch.")