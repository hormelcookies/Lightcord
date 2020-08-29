'use strict';
/* 
   This is a hack to get around the issues with electron-builder not including nested node_modules
   We do this by simply making the asar ourselves using the parameters from the build.
*/

const glob = require('fast-glob');
const fs = require('fs-extra');
const { promisify } = require('util')
const rimraf = promisify(require('rimraf'))
const asar = require('asar');

const commonExclude = [
    "!**/{test,__tests__,tests,powered-test,example,examples,CHANGELOG.md,README.md,README,readme.md,readme}",
    "!**/*.d.ts",
    "!**/.bin",
    "!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}",
    "!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}",
    "!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}",
    "!**/{appveyor.yml,.travis.yml,circle.yml}",
    "!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}"
]

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

exports.default = async function afterPackHook(context){
    
  const appDir = context.packager.info._appDir + "/"
  const platform = context.packager.platform.name
  let resourcesDir = context.appOutDir + "/resources/"
  // hardcoded exception for resources dir for mac
  if (platform == "mac"){
    resourcesDir = context.appOutDir + "/" + context.packager.appInfo.productFilename + ".app/Contents/Resources/"
  }

  const asarAppDir = resourcesDir + "app/"

  let globPatterns = context.packager.platformSpecificBuildOptions.files || context.packager._configuration.files || []
  let asarUnpackPattern = context.packager.platformSpecificBuildOptions.asarUnpack

  // a limitation of this method is that the asarUnpack option can only be a single string
  if (typeof asarUnpackPattern != "string"){
      if (Array.isArray(asarUnpackPattern) && asarUnpackPattern.length == 1){
        asarUnpackPattern = asarUnpackPattern[0]
      } else {
        throw Error("asarUnpack pattern can only be one string!")
      }
  }
  
  // remove current asar files
  await rimraf(resourcesDir + "app.asar")
  await rimraf(resourcesDir + "app")
  await rimraf(resourcesDir + "app.asar.unpacked")

  // electron-builder automatically adds this to the files parameter, so we have to too
  if (!globPatterns.includes("**/*")){
    globPatterns.push("**/*")
  }

  globPatterns = globPatterns.concat(commonExclude)
  
  let files = glob.sync(globPatterns, { dot:true, cwd: appDir})
  
  await new Promise ((resolve) => {
    files.forEach(async (file, index, array)=>{
      await fs.copy(appDir + file, asarAppDir + file)
      if (index == array.length -1){
        resolve()
      }
    })
  }).catch(console.error)

  // The only part that's hardcoded and not dependent on the electron-build config,
  // remove the unnecessary node-native files from the asar.app dir
  let unpackedFiles = glob.sync(asarUnpackPattern, {dot:true, cwd: asarAppDir})
  await new Promise ((resolve) => {
    unpackedFiles.forEach(async (file, index, array)=>{
      if (platform == "win") {
        if (file.includes(".node") && (file.includes("_linux") || file.includes("_darwin"))){
          await fs.remove(asarAppDir + file)
        }
      }
      else{
        if (file.includes(".node") && !file.includes("_" + platform) ){
          await fs.remove(asarAppDir + file)
        }
      }

      if (index == array.length -1){
        resolve()
      }
    })
  }).catch(console.error)


  await asar.createPackageWithOptions(asarAppDir, resourcesDir + "app.asar", {unpack: asarUnpackPattern})
  await rimraf(asarAppDir)
  return true
};
