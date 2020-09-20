const { join, dirname, isAbsolute, resolve } = require("path");
const fs = require("fs-extra");
const wget = require("wget-improved");
const unzipper = require("unzipper");
const asar = require("asar");
const { dapiPlatform } = require("./dapiHelpers");
const {ModulesVersionInfo} = require("./modulesVersionInfo");

const fetch = require('node-fetch');

const projectDir = resolve(__dirname, "../..")
const API_URL = "https://discord.com/api"


const DEFAULT_OUTPUT_DIR = join(projectDir, "downloaded_modules");

function getPendingFileString(options) {
    return `${options.module}-${options.branch}-${dapiPlatform(options.platform)}-${options.host_version}-${options.version}`;
}
function getPendingFileName(options) {
    return `${getPendingFileString(options)}.zip`;
}
function getPendingFilePath(options) {
    return join(options.outputDir, "pending_files", getPendingFileName(options));
}

/**
 * @param {Object} options
 * @param {string} options.module module name 
 * @param {number} options.version
 * @param {string} options.platform
 * @param {string} options.host_version
 * @param {string} options.outputDir
 * @param {string} options.branch 
 * @param {{clobber: boolean} | undefined} options.config
 * @returns {string} result
 */
async function download_and_unzip_module(options) {
    let module = options.module;
    let version = options.version;
    let platform = dapiPlatform(options.platform);
    let host_version = options.host_version;
    let outputDir = options.outputDir;
    let branch = options.branch;
    let config = options.config || {};
    let clobber = config.clobber;

    const downloadUrl = `${API_URL}/modules/${branch}/${module}/${version}?host_version=${host_version}&platform=${platform}`;

    const pendingFileName = getPendingFileName(options);
    const pendingFilePath = getPendingFilePath(options);

    // directory structure of extracted modules goes like this:
    // ${output}/${branch}/${platform}/${host_version}/${module}/${version}
    const extractedModulePath = join(outputDir, branch, platform, host_version, module, version.toString());

    if (fs.existsSync(pendingFilePath) && !clobber) {
        console.log("clobber = false, refusing to update existing file: " + pendingFileName);
        return "exists";
    }

    fs.removeSync(pendingFilePath);
    fs.mkdirpSync(dirname(pendingFilePath));

    let result = await fetch_module(downloadUrl, pendingFilePath);
    if (result) {
        result = await extract_module(pendingFilePath, extractedModulePath, clobber);
    }
    return result;
}

async function fetch_module(downloadUrl, pendingFilePath) {
    return new Promise(res => {
        console.log(downloadUrl);
        let download = wget.download(downloadUrl, pendingFilePath);

        download.on('error', function (err) {
            console.error(err);
            throw new Error(err);
        });
        download.on('start', (fileSize) => {
            console.log(`Downloading ${pendingFilePath}...`);
            console.log("fileSize = " + fileSize);
        });
        download.on('end', () => {
            console.log(`Finished downloading ${pendingFilePath}!`);
            res("downloaded");
        });
    });
}

async function extract_module(pendingFilePath, extractedModulePath, clobber) {
    return new Promise(res => {
        console.log(`Extracting ${pendingFilePath}...`);
        if (fs.existsSync(extractedModulePath) && !clobber) {
            console.log("clobber = false, refusing to update existing dir: " + extractedModulePath);
            res("exists");
            return;
        }

        fs.mkdirpSync(extractedModulePath);
        fs.createReadStream(pendingFilePath).pipe(unzipper.Extract({ path: extractedModulePath })).on('close', () => {
            if (fs.existsSync(join(extractedModulePath, "core.asar"))) {
                asar.extractAll(join(extractedModulePath, "core.asar"), join(extractedModulePath, "core"));
                fs.removeSync(join(extractedModulePath, "core.asar"));
            }
            console.log(`Finished extracting ${pendingFilePath}!`);
            res("extracted");
        });
    });
}

/**
 *
 *
 * @param {string} branch
 * @param {string} platform
 * @returns {import("./modulesVersionInfo").PlatformVersionInfo}
 */

async function getUpdatedPlatformInfo(branch, platform) {
    let new_platform_version = await fetch(`${API_URL}/updates/${branch}?platform=${platform}`)
        .then(res => res.json())
        .catch(err => { console.error(err); throw new Error(err); });

    let host_version = new_platform_version.name;

    console.log(`Newest version on branch ${branch}, platform ${platform}: ${host_version}`);

    let modules = await fetch(`${API_URL}/modules/${branch}/versions.json?host_version=${host_version}&platform=${platform}`)
        .then(res => res.json())
        .catch(err => { console.error(err); throw new Error(err); });

    return { host_version, modules };
}

/**
 *
 * Retrieves the latest version info from the API on the specified branch
 * @param {string} branch
 * @returns {ModulesVersionInfo}
 */
async function getUpdateInfo(branch) {
    console.log("Getting update info...");
    let versionInfo = {
        branch: branch
    };
    const validPlatforms = ['win', 'osx', 'linux'];
    for (platform of validPlatforms) {
        versionInfo[platform] = await getUpdatedPlatformInfo(branch, platform);
    }
    return new ModulesVersionInfo(versionInfo);
}

/**
 * @param {Object} options
 * @param {string} options.platform 
 * @param {ModulesVersionInfo} options.versionInfo The modules version info 
 * @param {string} [options.outputDir=DEFAULT_OUTPUT_DIR]
 * @param {boolean} [options.clobber=false]
 * @param {string} [options.branch='stable]
 */
async function get_modules_for_platform(options) {
    let platform = dapiPlatform(options.platform);

    let platform_info = options.versionInfo.getPlatformVersionInfo(platform);
    let branch = options.branch || options.versionInfo.branch || 'stable';
    let host_version = platform_info.host_version;
    let outputDir = options.outputDir || DEFAULT_OUTPUT_DIR;

    console.log(`Currently downloading modules for platform ${platform}`);
    for (entry of Object.entries(platform_info.modules)) {
        let moduleDloptions = {
            module: entry[0],
            version: entry[1],
            platform: platform,
            host_version: host_version,
            branch: branch,
            outputDir: outputDir,
            config: {
                clobber: options.clobber
            }
        };

        if (fs.existsSync(getPendingFilePath(moduleDloptions)) && !options.clobber) {
            console.log(`${getPendingFileString(moduleDloptions)} up to date`);
        } else {
            await download_and_unzip_module(moduleDloptions);
        }
    }
    console.log("Done downloading " + platform + " modules!");
    return platform;
}


/**
 * Downloads modules from the API.
 * If a path to the versionInfo isn't specified, it downloads the newest modules
 *
 * @param {Object} [options]
 * @param {string} [options.versionInfoPath] The path to the modules version info 
 * @param {{writeVersionInfo: boolean}|boolean} [options.upgrade] upgrade option
 * @param {boolean} [options.clobber=false]
 * @param {string} [options.outputDir=DEFAULT_OUTPUT_DIR]
 * @param {string|string[]} [options.platformsToDL=process.platform]
 * @param {string} [options.branch='stable']
 */
async function get_modules(options) {
    options = options || {};
    let upgrade = options.upgrade || false;
    let clobber = options.clobber || false;
    let outputDir = options.outputDir || DEFAULT_OUTPUT_DIR;
    let platformsToDL = options.platformsToDL || process.platform;
    let versionInfo = options.versionInfoPath ? new ModulesVersionInfo(options.versionInfoPath) : null
    let branch = options.branch || versionInfo.branch || 'stable';

    if (upgrade || !versionInfo) {
        versionInfo = await getUpdateInfo(branch);
        if (upgrade.writeVersionInfo){
            fs.writeFileSync(join(projectDir, "new_modules_version.json"), versionInfo.toString());
        }
    }

    if (!isAbsolute(outputDir)) {
        outputDir = join(process.cwd(), outputDir);
    }

    let platformList = [];
    if (platformsToDL === "all") {
        platformList = ['win', 'osx', 'linux'];
    } else if (typeof platformsToDL === 'string') {
        platformList = platformsToDL.split(',').map(p => dapiPlatform(p));
    } else {
        platformList = platformsToDL.map(p => dapiPlatform(p));
    }

    // We need to get the Windows version of desktop_core for development and patching, as 
    // while they are nearly the same between platforms, there are subtle differences 
    // between the files.
    if (!platformList.includes("win")) {
        let coreWinOptions = {
            module: "discord_desktop_core",
            host_version: versionInfo['win'].host_version,
            platform: 'win',
            version: versionInfo['win'].modules["discord_desktop_core"],
            branch: branch,
            outputDir: outputDir,
            config: {
                clobber: options.clobber
            }
        };
        if (fs.existsSync(getPendingFilePath(coreWinOptions)) && !options.clobber) {
            console.log(`${getPendingFileString(coreWinOptions)} up to date (for development/patching)`);
        } else {
            console.log('Downloading discord_desktop_core on platform "win" for development/patching...');
            await download_and_unzip_module(coreWinOptions);
        }
    }

    console.log(`Downloading modules on branch '${branch}' for the following platforms: `);
    platformList.forEach((platform) => {
        console.log("  " + platform + " - host_version: " + versionInfo[platform].host_version);
    });

    for (let platform of platformList) {
        platform = dapiPlatform(platform);
        let platformDLOptions = { platform, versionInfo, outputDir, clobber, branch };
        await get_modules_for_platform(platformDLOptions);
    }
}
exports.get_modules = get_modules;
