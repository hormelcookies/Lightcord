const {join, resolve} = require("path");
const {
    DEFAULT_DL_DIR,
    PATCHES_DIR,
    PROJECT_MODULES_DIR
} = require("./common");
const { Command } = require('commander');
const { createPatchesForModule } = require("recursive-patch");
const { ModulesVersionInfo } = require("../src/module_tools/modulesVersionInfo");

const projectDir = resolve(__dirname, "..");

// We only need to patch discord_desktop_core right now.
const modulesToPatch = ["discord_desktop_core"]

/**
 * @param {string} versionInfoPath
 * @param {string} downloadDir
 * @param {string} projectModulesDir
 * @param {string} patchesDir
 */

async function createPatches(versionInfoPath, downloadDir, projectModulesDir, patchesDir) {
    const versionInfo = new ModulesVersionInfo(versionInfoPath)
    // We only create patches from windows versions.
    const platform = "win"
    for (const moduleName of modulesToPatch) {
        const originalModuleDir = join(downloadDir, versionInfo.getModuleDLDir(moduleName, platform));
        const projectModuleDir = join(projectModulesDir, moduleName)
        const outputDir = join(patchesDir, moduleName)
        const moduleVersionInfo = versionInfo.getModuleVersionInfo(moduleName, platform);
        console.log("Creating paches for module " + moduleName);
        await createPatchesForModule(originalModuleDir, projectModuleDir, outputDir, {versionInfo:moduleVersionInfo});
    }
}

async function main(){
    const program = new Command()
    const defaultConfig = join(projectDir, "modules_version.json")

    program.option("-c, --version-info <config.json>", "Specify a version info file.\n\t", defaultConfig)
    program.option("--download-dir <DIR>",
                   "Directory where original modules were downloaded to.",
                   DEFAULT_DL_DIR)
    program.option("-m, --modules-dir <DIR>",
                   'Which workspace "modules" directory you want to create patches from',
                   PROJECT_MODULES_DIR)
    program.option("-p, --patches-dir <DIR>",
                    'Directory to output patches to.',
                   PATCHES_DIR)

    program.parse(process.argv)

    await createPatches(program.versionInfo, program.downloadDir, program.modulesDir, program.patchesDir);
}

main()

