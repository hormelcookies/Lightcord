//TODO: Move this to a .env or something

const { join, resolve } = require("path");

const DEFAULT_PROJECT_DIR = resolve(__dirname, "..");
const DEFAULT_DL_DIR = join(DEFAULT_PROJECT_DIR, "downloaded_modules");
const PROJECT_MODULES_DIR = join(DEFAULT_PROJECT_DIR, "modules");
const PATCHES_DIR = join(DEFAULT_PROJECT_DIR,"patches");


module.exports = { 
    DEFAULT_PROJECT_DIR: DEFAULT_PROJECT_DIR,
    DEFAULT_DL_DIR:DEFAULT_DL_DIR,
    PROJECT_MODULES_DIR:PROJECT_MODULES_DIR,
    PATCHES_DIR:PATCHES_DIR
}