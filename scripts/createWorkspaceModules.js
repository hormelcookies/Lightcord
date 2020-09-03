const Diff = require('diff');
const fs = require("fs-extra");
const glob = require("fast-glob");
const { basename, resolve } = require("path");
const { concatUnique, getFile, getTopLevelDirectories } = require("./common");
const { join, extname } = require('path');
const isTextOrBinary = require("istextorbinary");


const projectDir = resolve(__dirname, "..");
const originalModulesDir = join(projectDir, "original_modules")
const workspaceModulesDir = join(projectDir, "workspace_modules")
const patchesDir = join(projectDir, "patches")

function getPatch(relPath, moduleName) {
    let patch = {
        name: basename(relPath),
        isPatch: true,
        isDelete: false,
        relativePath: relPath,
        moduleName: moduleName,
        absolutePath: join(patchesDir, moduleName, relPath),
        fileInfo: {}
    };
    if (!fs.existsSync(patch.absolutePath)) {
        throw new Error("patch at path " + patch.absolutePath + " does not exist.")
    }
    patch.encoding = isTextOrBinary.isBinary(patch.absolutePath) ? "binary" : "utf8";
    if (extname(patch.name) === ".patch"){
        patch.text = fs.readFileSync(patch.absolutePath, { encoding: patch.encoding });
        patch.parsed = Diff.parsePatch(patch.text)[0]
        patch.fileInfo.name = basename(patch.parsed.index)
        patch.fileInfo.relativePath = patch.parsed.index
        patch.fileInfo.originalAbsolutePath = join(originalModulesDir, moduleName, patch.parsed.index);    
    } else if (extname(patch.name) === ".delete") {
        patch.parsed = null;
        patch.fileInfo = null;
        patch.isPatch = false;
        patch.isDelete = true;        
    }  else{
        //file to be copied
        patch.parsed = null;
        patch.fileInfo = null;
        patch.isPatch = false;
    }

    return patch;
}

async function createPackageJson(moduleName){
    let node_modules_dir = join(originalModulesDir, moduleName, "node_modules");
    let packageJsonPath = join(originalModulesDir, moduleName, "package.json");
    if (!fs.existsSync(node_modules_dir) || fs.existsSync(packageJsonPath)){
        return;
    }
    let package = {
        name: moduleName,
        version: "1.0.0",
        description: "",
        main: "index.js",      
    }
    package.dependencies = {}
    let nodeDirs = fs.readdirSync(node_modules_dir)
    nodeDirs.forEach((dir)=>{
        if (dir.indexOf(".") !== 0) {
            let packageJsonFile = join(node_modules_dir, dir, "package.json")
            if (fs.existsSync(packageJsonFile)) {
                let data = fs.readFileSync(packageJsonFile)
                let json = JSON.parse(data);
                package.dependencies[json.name] = json.version;
            }
        }
    });

    fs.writeFileSync(join(workspaceModulesDir, moduleName, "package.json"), JSON.stringify(package, null, 2))
}

async function applyPatchesForModule(moduleName){
    let patchesList = glob.sync(["**/*","!**/node_modules/**/*"], {cwd: join(patchesDir, moduleName)})
    
    if (fs.existsSync(join(workspaceModulesDir, moduleName))){
        fs.removeSync(join(workspaceModulesDir, moduleName))
    }
    //copy over original files
    let workspaceModuleDir = join(workspaceModulesDir, moduleName);
    fs.copySync(join(originalModulesDir, moduleName), workspaceModuleDir);
    //remove node_modules
    glob.sync(["**/node_modules"], {onlyDirectories: true, absolute: true, cwd: workspaceModuleDir}).forEach((dir)=>{
        fs.removeSync(dir)
    })

    patchesList.forEach((patchFile)=>{
        let patch = getPatch(patchFile, moduleName)
        let newFilePath;
        // delete stub
        if (patch.isDelete){
            newFilePath = join(workspaceModulesDir, moduleName, patch.relativePath).replace(".delete", "")
            fs.removeSync(newFilePath)
            return
        // not a patch, new file, just copy it over.
        } else if (!patch.isPatch){
            newFilePath = join(workspaceModulesDir, moduleName, patch.relativePath)
            fs.ensureFileSync(newFilePath)
            fs.copyFileSync(patch.absolutePath, newFilePath)
            return
        } 
        let fileToPatch = getFile(patch.fileInfo.relativePath, patch.fileInfo.originalAbsolutePath)
        let newFileData = Diff.applyPatch(fileToPatch.data, patch.text)
        newFilePath = join(workspaceModulesDir, moduleName, patch.fileInfo.relativePath);
        fs.removeSync(newFilePath)
        if (newFileData.length !== 0){
            fs.ensureFileSync(newFilePath)
            fs.writeFileSync(newFilePath, newFileData)    
        }
    })
}

async function main(){
    let patchesDirList = getTopLevelDirectories(patchesDir)
    let originalModulesDirList = getTopLevelDirectories(originalModulesDir)
    
    let dirsToPatch = patchesDirList.filter(dir => originalModulesDirList.includes(dir));
    let dirsToCopy  = originalModulesDirList.filter(dir => !dirsToPatch.includes(dir));
    console.log(dirsToCopy)
    for (moduleName of dirsToPatch){
        applyPatchesForModule(moduleName);
    }
    for (moduleName of dirsToCopy){
        fs.copySync(join(originalModulesDir, moduleName), join(workspaceModulesDir, moduleName));
            //remove node_modules
        glob.sync(["**/node_modules"], {onlyDirectories: true, absolute: true, cwd: join(workspaceModulesDir, moduleName)}).forEach((dir)=>{
            fs.removeSync(dir)
        })
        createPackageJson(moduleName)
    }
}

main();