const fs = require("fs-extra")
const path = require("path")

function copyWithMkdirp(src, dst){
    return new Promise((res,rej)=>{
        fs.copy(src,dst).then(res).catch(err=>{
            fs.mkdirpSync(path.dirname(dst))
            fs.copy(src,dst).then(res).catch(rej)
        })
    })
}
function writeFilewMkdirp(src, data, options){
    return new Promise((res,rej)=>{
        options = options || {}
        fs.writeFile(src,data, options).then(res).catch(err=>{
            fs.mkdirpSync(path.dirname(src))
            fs.writeFile(src,data, options).then(res).catch(rej)
        })
    })
}

function toPosixPath(winpath){
    return winpath.split(path.sep).join(path.posix.sep)
}

function getNpxCmdPath(cmd, inputDir){
    let cmdName = process.platform === "win32" ? `${cmd}.cmd` : `${cmd}`
    return path.join(inputDir, "node_modules", ".bin", cmdName)
}

async function getFiles(dir) {
    const dirents = await fs.readdir(dir, { withFileTypes: true, absolutePaths: false });
    const files = await Promise.all(dirents.map((dirent) => {
      const res = path.resolve(dir, dirent.name);
      return dirent.isDirectory() ? getFiles(res) : res;
    }));
    return Array.prototype.concat(...files);
}

function toFileUri(p){
    return "file:///" + toPosixPath(p)
}

module.exports = {
    toPosixPath,
    copyWithMkdirp,
    getNpxCmdPath,
    getFiles,
    toFileUri,
    writeFilewMkdirp
}