const { join, resolve} = require("path")
const { get_modules } = require("../src/module_tools/DownloadAPI")
const {DEFAULT_DL_DIR} = require("./common")
const {Command} = require("commander")

const projectDir = resolve(__dirname, "..")

async function main() {
    const program = new Command()
    const defaultConfig = join(projectDir, "modules_version.json")
    program.option("-c, --version-info <modules_version.json>", "Specify a version config file.\n\t", defaultConfig)
    program.option("-o, --output-dir <directory>", "Specify an output directory\n\t", DEFAULT_DL_DIR)
    program.option("-u, --upgrade", "Get the newest version of all modules")
    program.option("-p, --platform <platform>", 'Specify which platform to download.' +
                                                '\n\t\t\t\t  "all" will download all platforms.' +
                                                '\n\t\t\t\t  Default is your current platform.',
                                                process.platform)
    program.option("--force-redownload", 'force redownload files, overwriting existing ones')
    program.parse(process.argv)

    let options = {
        versionInfoPath: program.versionInfo,
        upgrade: program.upgrade,
        outputDir: program.outputDir,
        platformsToDL: program.platform,
        clobber: program.forceRedownload
    }
    await get_modules(options)    
}
main()


