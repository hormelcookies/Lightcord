const gulp = require("gulp")
const path = require('path')
const glob = require("fast-glob")
const execFile = require('util').promisify(require('child_process').execFile)
const fs = require("fs-extra")
const { toFileUri, getNpxCmdPath, writeFilewMkdirp } = require("../scripts/common.js")
const esBuild = require('esbuild').build
const footer = require('gulp-footer')
const jeditor = require('gulp-json-editor')
const { PROJECT_DIR,
    MODULES_DIR,
    APP_DIR } = require("./gulp.config.js");

async function npm_install(dir, args){
    let cmdName = process.platform === "win32" ? `npm.cmd` : `npm`
    let argv = ['i']
    if (args){
        argv.concat(args)
    }
    if (fs.existsSync(path.join(dir,"package.json"))){
        // just try again if it errors out, multi-process npm installs
        // can lead to cache errors sometimes
        try{
            await execFile(cmdName, argv, {env:process.env, cwd:dir}) 
        } catch (err){
            await execFile(cmdName, argv, {env:process.env, cwd:dir}) 
        }
    }
}

function copy_dir(inputDir, outputDir){
    return new Promise((resolve, reject)=>{
        try {
            fs.copySync(inputDir, outputDir);
            //remove node_modules
            glob.sync(["**/node_modules"], { onlyDirectories: true, absolute: true, cwd: outputDir})
            .forEach((dir) => {
                fs.removeSync(dir);
            });
            resolve()
        } catch (err){
            reject (err)
        }
    })
}

async function runNpmScript(dir, script){
    let cmd = "npm"
    let cmdName = process.platform === "win32" ? `${cmd}.cmd` : `${cmd}`
    await execFile(cmdName, ["run", script],{env:process.env, cwd:dir})
}

function copy_module(dir){
    let inputDir = path.join(MODULES_DIR, dir)
    let outputDir = path.join(APP_DIR, "modules", dir)
    return copy_dir(inputDir, outputDir)
}

async function generatePackageJson(dir, main) {
    main = main || 'dist/index.js'
    const dest = path.join(APP_DIR,dir, 'package.json')
    const pkg = JSON.parse(fs.readFileSync(path.join(PROJECT_DIR, dir, 'package.json')))
    let newpkg = {
        'name': pkg.name,
        'description': pkg.description,
        'version': pkg.version,
        'author': pkg.author,
        'license': pkg.lucense,
        'homepage_url': pkg.homepage,
        'main': main,
    }
    await writeFilewMkdirp(dest,JSON.stringify(newpkg,null,2))
}

async function mkSourceMap(file, src, dest){
    let sourcespath = path.join(src, file)
    path.resolve()
    let smjson = JSON.stringify({
        "version": 3,
        "sources": [toFileUri(sourcespath)],
    },null, 2)
    let mapfile = path.join(dest,file+".map")
    await writeFilewMkdirp(mapfile, smjson)
}

function runWebpack(dir){
    let inputDir = path.resolve(PROJECT_DIR, dir)
    let fullCmdPath = getNpxCmdPath('webpack', inputDir)
    let args = [];
    return execFile(fullCmdPath, args, {env:process.env, cwd:inputDir})
}

// changes the source map names to absolute filenames
async function fixSourceMap(outDir){
    let maps = glob.sync("**/*.map", {cwd: outDir})
    gulp.src("**/*.map", {cwd: outDir})
    .pipe(jeditor(function (json) {
        // remove duplicates
        const sources = json.sources.filter((s,idx)=>json.sources.indexOf(s) === idx)
        // make absolute
        json.sources = sources.map(s=>s.replace(/(?:(\.\.\/)|(\.\/))+/g, toFileUri(PROJECT_DIR) + '/'))
        return json
    })).pipe(gulp.dest(outDir))
    let sources = maps.map(m=>m.replace(".map", ""))
    await Promise.all(sources.map(source=>(appendSourceMapFooter(source, outDir))))
}

async function appendSourceMapFooter(source, outDir) {
    gulp.src(source, { cwd: outDir })
        .pipe(footer('//# sourceMappingUrl='+toFileUri(path.join(outDir,source) + ".map")))
        .pipe(gulp.dest(path.dirname(path.join(outDir,source))))
}

function tsc(dir){
    let inputDir = path.resolve(PROJECT_DIR, dir)
    let args = []
    if (process.env.NODE_ENV === 'production'){
        args.push("--outDir")
        args.push(path.join(APP_DIR,dir,"dist"))
    }
    let fullCmdPath = getNpxCmdPath('tsc', inputDir)
    return execFile(fullCmdPath, args, {env:process.env, cwd:inputDir})
}
/**@typedef {typeof import { BuildOptions } from "esbuild"} BuildOptions */
/**
 * @param  {String} outputDir
 * @param  {BuildOptions} options
 */
async function esbuildCompile(outputDir, options) {
    if (options.outfile){
        let outpath
        if (path.basename(outputDir) === path.dirname(options.outfile)){
            outpath = path.resolve(path.resolve(outputDir,".."), options.outfile)
        } else {
            outpath = path.resolve(outputDir, options.outfile)
        }
        options.outfile = outpath
    } else {
        options.outdir = outputDir
    }
    let result;
    try {
        result = await esBuild(options)
    } finally {
        if (result.warnings){
            result.warnings.map(w=>{
                //console.warn(w.location)
                //console.warn(w.text)
            })    
        }
    }
    await fixSourceMap(outputDir)
}

module.exports = {
    tsc,
    npm_install,
    copy_dir,
    runNpmScript,
    generatePackageJson,
    mkSourceMap,
    esbuildCompile,
    runWebpack
}
