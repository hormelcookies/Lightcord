
const {resolve } = require("path");
const {
    DEFAULT_DL_DIR,
    PATCHES_DIR,
} = require("./common");
const { join, } = require('path');
const { Command } = require("commander");
const { createLightcordModules } = require("../src/module_tools/createLightcordModules");

const projectDir = resolve(__dirname, "..")
const DEFAULT_WORKSPACE_DIR = (projectDir, "workspace_modules")

async function main(){
    const program = new Command()
    const defaultConfig = join(projectDir, "modules_version.json")

    program.option("-c, --version-info <config.json>", "Specify a version info file.\n\t", defaultConfig)
    program.option("--download-dir <DIR>",
                   "Directory where original modules were downloaded to.",
                   DEFAULT_DL_DIR)
    program.option("-m, --modules-dir <DIR>",
                   'Which workspace "modules" directory to write the modules to.',
                   DEFAULT_WORKSPACE_DIR)
    program.option("-p, --patches-dir <DIR>",
                    'Directory to output patches to.',
                   PATCHES_DIR)
    let options = {
        versionInfoPath: program.versionInfo, 
        downloadDir: program.downloadDir,
        modulesDir: program.modulesDir,
        patchesDir: program.patchesDir
    }
    createLightcordModules(options);
}

main();