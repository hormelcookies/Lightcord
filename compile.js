const spawn = require("cross-spawn")
const { join } = require("path")

/** Main Project */
spawnSync("tsc")
/** BetterDiscord */
spawnSync("npm run build-prod", join(__dirname, "BetterDiscordApp"))
spawnSync("npm run build", join(__dirname, "BetterDiscordApp"))
spawnSync("npm run minify-css", join(__dirname, "BetterDiscordApp"))
/** DiscordJS */
spawnSync("npm run build", join(__dirname, "DiscordJS"))
/** LightcordApi */
spawnSync("npm run build", join(__dirname, "LightcordApi"))
spawnSync("npm run build-prod", join(__dirname, "LightcordApi"))
spawnSync("tsc", join(__dirname, "LightcordApi"))

var exitedWithErrorProcessList = [];

function spawnSync(cmdString, cwd){
    let args = cmdString.split(" ")
    let command = args.shift()
    return spawn(command, args, {
        cwd: cwd || process.cwd(),
        env: process.env,
        stdio: "inherit"
    }).on("error", (err) => {
        const DIRSTRING = cwd != undefined ? cwd : process.env.PWD
        console.log("Error while running " + cmdString + " in target directory " + DIRSTRING)
        console.error(err)
        exitedWithErrorProcessList.push({cmd: cmdString, cwd: DIRSTRING})
    })    
}

process.on("beforeExit", () => {
    if (exitedWithErrorProcessList.length != 0){
        console.error("Commands exited with errors:\n")
        exitedWithErrorProcessList.forEach((val)=>{
            console.error("\tcommand:\t\t" + val.cmd + "\n\ttarget directory:\t" + val.cwd + "\n")
        });
    }
    console.log(`Exiting compilation`)
})