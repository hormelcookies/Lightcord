
const path = require("path")
const {task,series} = require("gulp")

const {
    npm_install,
    esbuildCompile,
    generatePackageJson,
} = require('./gulpfile.tasks.js');


const {PROJECT_DIR, APP_DIR} = require('./gulp.config.js')

const MODULE_NAME = "LightcordApi"
const LightcordApiesbuildOptions = {
    target: "chrome83",
    platform: "browser",
    entryPoints: [path.join(PROJECT_DIR, MODULE_NAME, "src", "index.ts")],
    outfile: "js/main.js",
    tsconfig: path.join(PROJECT_DIR, MODULE_NAME, "tsconfig.json"),
    bundle: true,
    minify: false,
    sourcemap: "external",
    format: "cjs",
    external: [
        `electron`,
        `fs`,
        `path`,
        `events`,
        `rimraf`,
        `yauzl`,
        `mkdirp`,
        `request`,
        "node-fetch",
        "uuid/v1",
        "uuid/v4",
        "powercord/webpack"
    ]
}

function createLightcordApiTasks(buildtype){
    const config = Object.assign({},LightcordApiesbuildOptions)
    const outputDir = path.dirname(path.resolve(APP_DIR, MODULE_NAME, config.outfile))
    const tasknames = []
    if (buildtype === 'build'){
        config.minify = true;
        task(`create-package-json:${MODULE_NAME}`,()=>{return generatePackageJson(MODULE_NAME, config.outfile)})
        tasknames.push(`create-package-json:${MODULE_NAME}`)
    } else if (buildtype === 'devinstall') {
        task(`npm-install:${MODULE_NAME}`, ()=>{return npm_install(MODULE_NAME)})
        tasknames.push(`npm-install:${MODULE_NAME}`)    
    } else {
        config.minify = false;
        config.sourcemap = "inline"
    }
    task(`esbuild:${MODULE_NAME}`,()=>{return esbuildCompile(outputDir, config)})
    tasknames.push(`esbuild:${MODULE_NAME}`)
    return series(tasknames)
}

exports.createLightcordApiTasks = createLightcordApiTasks