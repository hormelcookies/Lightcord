const spawn = require("cross-spawn")
const { join, resolve } = require("path")
const fs = require("fs-extra")
const wget = require("wget-improved")
const unzipper = require("unzipper")
const asar = require("asar")

const projectDir = resolve(__dirname, "..")

const moduleVersions = require(join(projectDir, "modules_version"))


const originalModulesDir = join(projectDir, "original_modules")
const pendingModulesDir = join(projectDir, "pending_modules")

async function download_and_unzip_module(module, version, platform, host_version){
    return new Promise((resolve, reject)=>{
        const downloadUrl = `https://discord.com/api/modules/stable/${module}/${version}?host_version=${host_version}&platform=${platform}`
        const outputFile = join(pendingModulesDir, `${module}_${platform}-${version}.zip`);

        console.log(downloadUrl)
        let download = wget.download(downloadUrl, outputFile)
    
        download.on('error', function(err) {
            console.log(err);
        });
        download.on('start', (fileSize) =>{
            console.log(`Downloading ${outputFile}...`)
            console.log("fileSize = " + fileSize);
        });
        download.on('end', async (output) =>{
            console.log(`Finished downloading ${outputFile}!`)
            console.log(`Extracting ${outputFile}...`)

            let outputDir = join(originalModulesDir, module);
            fs.createReadStream(outputFile).pipe(unzipper.Extract({path: outputDir})).on('close', ()=>{
                if (fs.existsSync(join(outputDir, "core.asar"))){
                    asar.extractAll(join(outputDir, "core.asar"), join(outputDir, "core"))
                    fs.removeSync(join(outputDir, "core.asar"))       
                }
                console.log(`Finished extracting ${outputFile}!`)

                resolve();
            })
        });
    })
}

async function get_modules_for_current_platform(){
    platform = process.platform;
    if (platform === "darwin"){
        platform = "osx"
    }
    platform_info = moduleVersions[platform];
    host_version = platform_info.host_version;
    console.log("Downloading modules for platform linux")
    console.log(platform_info.modules)
    for (entry of Object.entries(platform_info.modules)){
        let module = entry[0];
        let version = entry[1];
        await download_and_unzip_module(module, version, platform, host_version);
    }
    console.log("Done downloading linux files!")
}

async function main(){
    fs.removeSync(pendingModulesDir)
    fs.mkdirpSync(pendingModulesDir)
    fs.removeSync(originalModulesDir)
    fs.mkdirpSync(originalModulesDir)

    await get_modules_for_current_platform()    
}
main()