const path = require("path")

const PROJECT_DIR = path.resolve(__dirname,'..')
const MODULES_DIR = path.join(PROJECT_DIR, "modules")

let appdir = path.join(PROJECT_DIR,"distApp")
if (process.env.NODE_ENV !== 'production'){
    appdir = PROJECT_DIR
}
const APP_DIR = appdir

module.exports = {
    PROJECT_DIR,
    MODULES_DIR,
    APP_DIR,
}