
const path = require("path")
const {task, series} = require("gulp")
const {
    npm_install,
    runWebpack,
    generatePackageJson,
} = require('./gulpfile.tasks.js');

const {PROJECT_DIR, APP_DIR} = require('./gulp.config.js')

const MODULE_NAME = "DiscordJS"
const DiscordJSesbuildOptions = {
    target: "chrome83",
    platform: "browser",
    entryPoints: [path.join(PROJECT_DIR, MODULE_NAME, "src", "index.ts")],
    tsconfig: path.join(PROJECT_DIR, MODULE_NAME, "tsconfig.json"),
    bundle: true,
    minify: false,
    outdir: "js",
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
        "node-fetch"
    ]
}

function createDiscordJSTasks(buildtype){
    const config = DiscordJSesbuildOptions
    const outputDir = path.resolve(APP_DIR, MODULE_NAME, config.outdir)
    const tasknames = []
    if (buildtype === 'build'){
        task(`create-package-json:${MODULE_NAME}`,()=>{return generatePackageJson(MODULE_NAME, 'dist/index.js')})
        tasknames.push(`create-package-json:${MODULE_NAME}`)
    } else if (buildtype === 'devinstall') {
        task(`npm-install:${MODULE_NAME}`, ()=>{return npm_install(MODULE_NAME)})
        tasknames.push(`npm-install:${MODULE_NAME}`)    
    }
    task(`run-webpack:${MODULE_NAME}`, ()=>{return runWebpack(MODULE_NAME)})
    //task(`esbuild:${MODULE_NAME}`,()=>{return esbuildCompile(outputDir, config)})
    tasknames.push(`run-webpack:${MODULE_NAME}`)
    return series(tasknames)
}
exports.createDiscordJSTasks = createDiscordJSTasks