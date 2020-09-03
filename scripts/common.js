const fs = require("fs-extra");
const { basename } = require("path");
const isTextOrBinary = require("istextorbinary");

function getTopLevelDirectories(path){
    return fs.readdirSync(path, {withFileTypes: true})
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
}

function getFile(relativePath, path) {
    let file = {
        name: basename(relativePath),
        relativePath: relativePath,
        absolutePath: path,
        exists: false,
        encoding: null,
        data: ""
    };
    if (fs.existsSync(path)) {
        file.exists = true;
        file.encoding = isTextOrBinary.isBinary(path) ? "binary" : "utf8";
        let options = file.encoding === "utf8" ? {encoding: "utf8"} : undefined;
        file.data = fs.readFileSync(path, options);
    }
    return file;
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
    getFile: getFile,
    getTopLevelDirectories: getTopLevelDirectories
}