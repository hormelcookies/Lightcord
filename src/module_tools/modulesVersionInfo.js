const fs = require("fs-extra");
const { join, isAbsolute } = require("path");
const { dapiPlatform } = require("./dapiHelpers");

/**
 * @typedef {Object} VersionInfo
 * @property {string} branch
 * @property {PlatformVersionInfo} win
 * @property {PlatformVersionInfo} osx
 * @property {PlatformVersionInfo} linux
 */

/**
 * @typedef {Object} PlatformVersionInfo
 * @property {string} host_version
 * @property {{ [key: string]: number }} modules
 */

class ModulesVersionInfo {
    /**
     *Creates an instance of ModulesVersionInfo.
     * @param {string | VersionInfo} versionInfo
     * @memberof ModulesVersionInfo
     */
    constructor(versionInfo){
        if (typeof versionInfo === 'string'){
            versionInfo = this.loadVersionConfig(versionInfo);
        }
        this.branch = versionInfo.branch;
        this.win = versionInfo.win;
        this.osx = versionInfo.osx;
        this.linux = versionInfo.linux;
    }

    /**
     * @param {string} platform
     * @returns {PlatformVersionInfo}
     * @memberof ModulesVersionInfo
     */
    getPlatformVersionInfo(platform){
        let p = dapiPlatform(platform)
        if (p === 'win'){
            return this.win;
        } else if (p === 'osx'){
            return this.osx;
        } else if (p === 'linux'){
            return this.linux;
        } else {
            throw new Error("Why did you do that?!")
        }
    }

    /**
     * returns relative path to downloaded module.
     * 'branch/platform/host_version/module/version'
     * @param {string} moduleName
     * @param {string} platform
     * @returns {string} 
     * @memberof ModulesVersionInfo
     */
    getModuleDLDir(moduleName, platform) {
        platform = dapiPlatform(platform);
        const platform_info = this.getPlatformVersionInfo(platform);
        const branch = this.branch;
        const host_version = platform_info.host_version;
        const version = platform_info.modules[moduleName];
    
        // ${branch}/${platform}/${host_version}/${module}/${version}
        return join(branch, platform, host_version, moduleName, version.toString());
    }

    /**
     *
     *
     * @param {string} path
     * @returns {VersionInfo}
     * @memberof ModulesVersionInfo
     */
    loadVersionConfig(path) {
        let error = null;
        if (typeof path !== "string") {
            return path;
        }
        try {
            let absoluteConfigPath = join(process.cwd(), path);
            if (!isAbsolute(path) && fs.existsSync(absoluteConfigPath)) {
                return require(absoluteConfigPath);
            } else if (fs.existsSync(path)) {
                return require(path);
                // string literal object
            } else {
                return JSON.parse(path);
            }
        } catch (e) {
            error = e;
        }
        throw new Error("could not load specified config: " + path + "\n" + error);
    }

    /**
     * @typedef {Object} ModuleVersionInfo
     * @property {string} module
     * @property {string} branch
     * @property {string} platform
     * @property {string} host_version
     * @property {number} version
     */


    /**
     * @param {string} module
     * @param {string} platform
     * @returns {ModuleVersionInfo}
     * @memberof ModulesVersionInfo
     */
    getModuleVersionInfo(module, platform){
        return {
            module: module,
            branch: this.branch,
            platform: platform,
            host_version: this[platform].host_version,
            version: this[platform].modules[module]
        }
    }

    toString(){
        return JSON.stringify({
            branch: this.branch,
            win: this.win,
            osx: this.osx,
            linux: this.linux
        }, null, 2)
    }
}
exports.ModulesVersionInfo = ModulesVersionInfo;