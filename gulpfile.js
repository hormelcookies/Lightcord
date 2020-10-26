const gulp = require("gulp")
const { task } = require("gulp")
const path = require('path')
const glob = require("fast-glob")
const fs = require("fs-extra")

const { npm_install, esbuildCompile } = require('./gulp/gulpfile.tasks.js');

const { createDiscordJSTasks } = require("./gulp/gulpfile.DiscordJS")
const { createLightcordApiTasks } = require("./gulp/gulpfile.LightcordApi")
const { createBDAPPTasks } = require("./gulp/gulpfile.BDAPP")
const { createDiscordModuleTasks } = require("./gulp/gulpfile.discordmodules")

const {    
    PROJECT_DIR,
    APP_DIR
} = require("./gulp/gulp.config.js")

const rootCompileOptions = {
    target: "node12",
    platform: "node",
    outdir: "dist",
    bundle: false,
    minify: false,
    format: 'cjs',
    tsconfig: path.join(PROJECT_DIR, "tsconfig.json"),
    sourcemap: "external"
}

// project root tasks
function removeAppDir(){
    if (PROJECT_DIR === APP_DIR){
        throw new Error("Cowardly refusing to remove project directory. \n\t Did you forget to set NODE_ENV to 'production'?")
    }
    return fs.remove(APP_DIR)
}
task(removeAppDir)

function copyProjectFiles(){
    fs.mkdirpSync(APP_DIR)
    return Promise.all([
        fs.copy(path.join(PROJECT_DIR, "splash"), path.join(APP_DIR,"splash")),
        fs.copyFile(path.join(PROJECT_DIR, "package-lock.json"), path.join(APP_DIR,"package-lock.json")),
        fs.copyFile(path.join(PROJECT_DIR, "package.json"), path.join(APP_DIR,"package.json")),
        fs.copyFile(path.join(PROJECT_DIR, "LICENSE"), path.join(APP_DIR,"LICENSE")),
    ])
}
task(copyProjectFiles)

async function generatebuildinfoJson() {
    fs.writeFileSync(path.join(APP_DIR, 'build_info.json'),JSON.stringify({
        "releaseChannel": "stable", 
        "version": "0.0.308"
    },null,2))
}
task(generatebuildinfoJson)

//**** create tasks
function createPackageRootTasks(buildtype){
    const inputDir = path.resolve(PROJECT_DIR, "src")
    const outputDir = path.resolve(APP_DIR, "dist")
    const config = rootCompileOptions
    config.entryPoints = glob.sync("**/*",{cwd:inputDir,absolute:true})
    task(`esbuild:projectRoot`, ()=>{return esbuildCompile(outputDir,config)})
    let tasks = []
    if (buildtype === 'build'){
        config.minify = true
        task(`npm-install:projectRoot`,()=>{ return npm_install(APP_DIR) })
        tasks = [`esbuild:projectRoot`,  gulp.series(copyProjectFiles, `npm-install:projectRoot`, generatebuildinfoJson)]
    } else {
        tasks = [`esbuild:projectRoot`, generatebuildinfoJson]
    }
    return gulp.parallel(tasks)
}

function createTasks(buildtype){
    const moduleTasks = []
    moduleTasks.push(createPackageRootTasks(buildtype))
    moduleTasks.push(createDiscordJSTasks(buildtype))
    moduleTasks.push(createLightcordApiTasks(buildtype))
    moduleTasks.push(createBDAPPTasks(buildtype))
    moduleTasks.push(createDiscordModuleTasks(buildtype))
    return moduleTasks
}

const devinstalltasks = gulp.parallel(createTasks('devinstall'))
const compiletasks = gulp.parallel(createTasks('compile'))
const buildtasks = gulp.series('removeAppDir',gulp.parallel(createTasks('build')))
task('devinstall', devinstalltasks)
task('compile',compiletasks)
task('build', buildtasks)