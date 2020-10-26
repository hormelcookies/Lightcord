const {generatePackageJson, runWebpack, npm_install} = require("./gulpfile.tasks.js")
const gulp = require("gulp")
const path = require("path")
const csso = require("gulp-csso")
const rename = require("gulp-rename")
const {task} = require("gulp")

const {PROJECT_DIR, APP_DIR} = require('./gulp.config.js')

async function minifycss(){
    let input = path.resolve(PROJECT_DIR, "BetterDiscordApp/src/styles/index.css")
    let output = path.resolve(APP_DIR, "BetterDiscordApp/dist")
    gulp.src(input)
                  .pipe(csso({restructure: false}))
                  .pipe(rename("style.css"))
                  .pipe(gulp.dest(output))
}

function createBDAPPTasks(buildtype){
    task('run-webpack:BetterDiscordApp', ()=>{return runWebpack("BetterDiscordApp")})
    task(`minify-css:BetterDiscordApp`, minifycss);
    let tasks;

    if (buildtype === 'build'){
        task(`create-package-json:BetterDiscordApp`,()=>{return generatePackageJson("BetterDiscordApp")})
        tasks = gulp.parallel(['run-webpack:BetterDiscordApp', 'minify-css:BetterDiscordApp', `create-package-json:BetterDiscordApp`])
    } else if (buildtype === 'devinstall'){
        task(`npm-install:BetterDiscordApp`, ()=>{return npm_install("BetterDiscordApp")})
        tasks = gulp.series(`npm-install:BetterDiscordApp`, gulp.parallel('run-webpack:BetterDiscordApp', 'minify-css:BetterDiscordApp'))
    } else {
        tasks = gulp.parallel('run-webpack:BetterDiscordApp', 'minify-css:BetterDiscordApp')
    }
    return tasks
}

exports.createBDAPPTasks = createBDAPPTasks