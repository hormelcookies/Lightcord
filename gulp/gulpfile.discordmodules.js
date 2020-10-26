const gulp = require("gulp");
const { task } = require("gulp");
const path = require('path');
const glob = require("fast-glob");
const fs = require("fs-extra");
const { copyWithMkdirp } = require("../scripts/common.js");
const micromatch = require('micromatch');
const { PROJECT_DIR,
    MODULES_DIR,
    APP_DIR} = require("./gulp.config.js");

const buildTypes = ["**/*.js", "**/*.ts"];
const minOnlyTypes = ["**/*.min.js", "**/*.d.ts", "**/*.jsx"];
const ignoredFiles = ["+(**/node_modules/**/*|node_modules/**/*)", "**/*.log"];

const discordCompileOptions = {
    target: "node12",
    platform: "node",
    bundle: false,
    minify: true,
    sourcemap: "external",
}

const BLACKLISTED_MODULES = ["discord_spellcheck"]

const { npm_install,
    esbuildCompile } = require('./gulpfile.tasks.js');

function getAllDiscordModules() {
    let modules = fs.readdirSync(MODULES_DIR, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
    return modules.filter(module => !BLACKLISTED_MODULES.includes(module));
}

async function minifyFiles(files, src, dst) {
    await Promise.all(files.map(file => copyWithMkdirp(path.join(src, file), path.join(dst, file))));
}

function createDiscordModulesCompileTasks(inputDir, config, module, outputDir) {
    const files = glob.sync(["**/*"], { ignore: ignoredFiles, cwd: inputDir });
    const buildFiles = micromatch(files, buildTypes, { ignore: minOnlyTypes }).map(f => path.join(inputDir, f));
    const minOnlyFiles = micromatch(files, minOnlyTypes);
    const copyOnlyFiles = micromatch(files, ["**/*"], { ignore: minOnlyTypes.concat(buildTypes) });

    config.entryPoints = buildFiles;
    let compileTasks = [];
    if (buildFiles.length > 0) {
        task(`esbuild:${module}`, () => { return esbuildCompile(outputDir, config); });
        compileTasks.push(`esbuild:${module}`);
    }
    if (minOnlyFiles.length > 0) {
        task(`minify:${module}`, () => { return minifyFiles(minOnlyFiles, inputDir, outputDir); });
        compileTasks.push(`minify:${module}`);
    }
    if (copyOnlyFiles.length > 0) {
        task(`copy-files:${module}`, () => {
            return Promise.all(copyOnlyFiles.map(file => copyWithMkdirp(path.join(inputDir, file), path.join(outputDir, file))));
        });
        compileTasks.push(`copy-files:${module}`);
    }
    return compileTasks;
}

function createDiscordModuleTasks(buildtype) {
    const discordModules = getAllDiscordModules();
    let tasks = discordModules.map((module) => {
        const config = Object.assign({}, discordCompileOptions);
        const inputDir = path.resolve(PROJECT_DIR, "modules", module);
        const outputDir = path.resolve(APP_DIR, "modules", module);
        let modTasks = [];
        if (buildtype === 'build'){
            let compileTasks = createDiscordModulesCompileTasks(inputDir, config, module, outputDir);   
            modTasks= [gulp.parallel(compileTasks)]
        }
        if (buildtype === 'build' || buildtype === 'devinstall'){
            const npmiDir = module === 'discord_desktop_core' ? path.join(outputDir, 'core') : outputDir;
            if (fs.existsSync(path.join(npmiDir, "package.json"))) {
                task(`npm-install:${module}`, () => { return npm_install(npmiDir, ['--production']); });
                modTasks.push(`npm-install:${module}`);
            }    
        }
        if (modTasks.length === 0){
            return "notask"
        }
        return gulp.series(modTasks);
    });
    return tasks.filter(t=>t !== "notask");
}

exports.createDiscordModuleTasks = createDiscordModuleTasks;
