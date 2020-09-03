const Diff = require('diff');
const fs = require("fs-extra");
const glob = require("fast-glob");
const {join, resolve} = require("path");
const { concatUnique, getFile } = require("./common");


const projectDir = resolve(__dirname, "..");
const modulesDir = join(projectDir, "modules")
const originalModulesDir = join(projectDir, "original_modules")
const patchesDir = join(projectDir,"patches")

function createPatch(file, moduleName){

    let originalFile = getFile(file, join(originalModulesDir, moduleName, file));
    let projectFile = getFile(file, join(modulesDir, moduleName, file));
    let patchFilePath = join(projectDir,"patches",moduleName, file + ".patch");
    if (projectFile.exists){
        let newFilePath = join(projectDir,"patches",moduleName, file)
        // just copy new files.
        if (!originalFile.exists){
            fs.ensureFileSync(newFilePath)
            fs.copyFileSync(projectFile.absolutePath, newFilePath);
        // If binary files differ, copy them.
        } else if (originalFile.encoding === "binary" && projectFile.encoding === "binary"){
            if ( Buffer.compare(originalFile.data, projectFile.data) !== 0 ) {
                fs.ensureFileSync(newFilePath)
                fs.copyFileSync(projectFile.absolutePath, newFilePath);    
            }
        // otherwise, if it's a text file, make a patch.
        } else {
            let patch = Diff.createPatch(file, originalFile.data, projectFile.data);
            newFilePath += ".patch"
            if (Diff.parsePatch(patch)[0].hunks.length !== 0){
                fs.ensureFileSync(newFilePath)
                fs.writeFileSync(patchFilePath , patch , {encoding: "utf8"})
            }
        }
    } else {
        // 0-length file to ensure file is deleted
        fs.ensureFileSync(join(projectDir,"patches",moduleName, file + ".delete"))
    }
}

async function createPatchesForModule(moduleName){

    let originalFileList = glob.sync(["**/*","!**/node_modules/**/*"], {cwd: join(originalModulesDir, moduleName)})
    let projectFilesList = glob.sync(["**/*","!**/node_modules/**/*"], {cwd: join(modulesDir, moduleName)})
    files = concatUnique(originalFileList, projectFilesList);
    files.forEach((file)=>{
        createPatch(file, moduleName)
    })
}


let modulesDirList = fs.readdirSync(modulesDir, {withFileTypes: true}).filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
let originalModulesDirList = fs.readdirSync(originalModulesDir, {withFileTypes: true}).filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);

let dirsToPatch = modulesDirList.filter(val => originalModulesDirList.includes(val));

fs.removeSync(patchesDir)
/*
for (dir of dirsToPatch){
    createPatchesForModule(dir);
}*/
createPatchesForModule("discord_desktop_core");
