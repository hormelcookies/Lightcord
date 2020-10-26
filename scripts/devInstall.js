//require('dotenv').config()
const { join } = require("path")
const PROJECT_DIRNAME=join(__dirname, "..")
const child_process = require("child_process")

let env = process.env

function spawnProcess(cmd, args) {
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
function npmistring(){
    if (process.platform === "win32"){
        return ["i", "--save-dev", "--arch=ia32", "electron@9.3.1"]
    } else {
        return ["i", "--save-dev", "--arch=x64", "electron@9.3.1"]
    }
}

try{
    spawnProcess("npm",npmistring())
//just try again
} catch (err){
    spawnProcess("npm",npmistring())
}
let runString = "`npm test`"

spawnProcess(join(PROJECT_DIRNAME,"node_modules",".bin","gulp"), ["devinstall"])

console.log("Everything is installed. You should be able to do "+runString+" to compile everything and launch.")