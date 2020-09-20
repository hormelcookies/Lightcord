const fs = require("fs-extra");
const glob = require("fast-glob");
const { getTopLevelDirectories, makeDirAbsolute } = require("./common");
const { dapiPlatform } = require("./dapiHelpers");
const { join } = require('path');
const { applyPatchesForModule } = require("recursive-patch");
const { ModulesVersionInfo } = require("./modulesVersionInfo");

const BLACKLISTED_MODULES = ['discord_spellcheck'];

/**
 * @param {string} moduleName
 * @param {string} originalModuleDir
 * @param {string} workspaceModulesDir
 * @returns
 */
async function createPackageJson(moduleName, originalModuleDir, workspaceModulesDir) {
    let node_modules_dir = join(originalModuleDir, "node_modules");
    let packageJsonPath = join(originalModuleDir, "package.json");
    if (!fs.existsSync(node_modules_dir) || fs.existsSync(packageJsonPath)) {
        return;
    }
    let package = {
        name: moduleName,
        version: "1.0.0",
        description: "",
        main: "index.js",
    };
    package.dependencies = {};
    let nodeDirs = fs.readdirSync(node_modules_dir);
    nodeDirs.forEach((dir) => {
        if (dir.indexOf(".") !== 0) {
            let packageJsonFile = join(node_modules_dir, dir, "package.json");
            if (fs.existsSync(packageJsonFile)) {
                let data = fs.readFileSync(packageJsonFile);
                let json = JSON.parse(data);
                package.dependencies[json.name] = json.version;
            }
        }
    });

    fs.writeFileSync(join(workspaceModulesDir, moduleName, "package.json"), JSON.stringify(package, null, 2));
}

/**
 *
 *
 * @param {Object} options
 * @param {string} options.downloadDir
 * @param {string} options.workspaceModulesDir
 * @param {string} options.patchesDir
 * @param {string} options.versionInfoPath
 */
function createLightcordModules(options) {
    let downloadDir = makeDirAbsolute(options.downloadDir);
    let workspaceModulesDir = makeDirAbsolute(options.modulesDir);
    let patchesDir = makeDirAbsolute(options.patchesDir);

    let versionInfo = new ModulesVersionInfo(options.versionInfoPath);
    let modulesToPatch = getTopLevelDirectories(patchesDir);
    let originalModulesDirList = [];
    let modulesToCopy = [];

    // We get our own platform here, but the patches will be applied to the windows version
    let ourPlatform = dapiPlatform(process.platform);
    let platform_info = versionInfo.getPlatformVersionInfo(ourPlatform);

    for (let name of Object.keys(platform_info.modules)) {
        let dir = join(downloadDir, versionInfo.getModuleDLDir(name, ourPlatform));
        originalModulesDirList.push(dir);

        if (modulesToPatch.includes(name)) {
            // we create patched modules dirs from Windows version regardless right now
            const platform = "win";
            const originalModuleDir = join(downloadDir, versionInfo.getModuleDLDir(name, platform));
            const modulesPatchesDir = join(patchesDir, name);
            const outputDir = join(workspaceModulesDir, name);
            const moduleVersionInfo = versionInfo.getModuleVersionInfo(name, platform);
            applyPatchesForModule(originalModuleDir, modulesPatchesDir, outputDir, {versionInfo: moduleVersionInfo});
        }
        else if (!BLACKLISTED_MODULES.includes(name)) {
            modulesToCopy.push({ name: name, dir: dir });
        }
    }

    for (let module of modulesToCopy) {
        let moduleName = module.name;
        let dir = module.dir;
        const toDir = join(workspaceModulesDir, moduleName);
        fs.removeSync(toDir);
        fs.copySync(dir, toDir);

        //remove node_modules
        glob.sync(["**/node_modules"], { onlyDirectories: true, absolute: true, cwd: toDir })
            .forEach((dir) => {
                fs.removeSync(dir);
            });
        // dynamically generate package.json if needed
        createPackageJson(moduleName, dir, workspaceModulesDir);
    }

    //temporary hack to get discord_overlay2 working
    //apparently the directory works fine if you rename it, lol
    fs.renameSync(join(workspaceModulesDir,"discord_desktop_core","core"), join(workspaceModulesDir,"discord_desktop_core","core.asar"))
    fs.writeFileSync(join(workspaceModulesDir,"discord_desktop_core","index.js"), "module.exports = require('./core.asar');")
}
exports.createLightcordModules = createLightcordModules;
