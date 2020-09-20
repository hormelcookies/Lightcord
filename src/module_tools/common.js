const fs = require("fs-extra");
const { join, isAbsolute } = require("path");


function makeDirAbsolute(dir){
    if (typeof dir !== 'string') return null;

    if (!isAbsolute(dir)){
        dir = join(process.cwd(), dir)
    }
    return dir;
}

function getTopLevelDirectories(path){
    return fs.readdirSync(path, {withFileTypes: true})
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
}

function concatUnique(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b)) {
        throw Error("both parameters must be arrays");
    }
    let arr = a.concat(b);
    let seen = {};
    return arr.filter(function (item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}

module.exports = { 
    concatUnique: concatUnique,
    getTopLevelDirectories: getTopLevelDirectories,
    makeDirAbsolute: makeDirAbsolute
}