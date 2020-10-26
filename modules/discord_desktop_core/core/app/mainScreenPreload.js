'use strict';

// App preload script, used to provide a replacement native API now that
// we turned off node integration.

process.on("uncaughtException", console.error)

const ipcRenderer = require('./discord_native/renderer/ipc');
const electron = require("electron")
const moduleAlias = require("./BetterDiscord/loaders/module-alias")
const path = require("path")
const Buffer = require("safe-buffer").Buffer

moduleAlias.setMain(module)
const isPackaged = __filename.includes("app.asar")
moduleAlias.addAlias("LightcordApi", path.join(__dirname, "../../../../LightcordApi"))
moduleAlias.addAlias("DiscordJS", path.join(__dirname, "../../../../DiscordJS"))
moduleAlias.addAlias("BetterDiscordApp", path.join(__dirname, "../../../../BetterDiscordApp/dist/index.js"))
moduleAlias.addAlias("BetterDiscordApp/dist/style.css",path.join(__dirname, "../../../../BetterDiscordApp/dist/style.css"))
moduleAlias.addPath(path.join(__dirname, "BetterDiscord", "modules"))


const TRACK_ANALYTICS_EVENT = 'TRACK_ANALYTICS_EVENT';
const TRACK_ANALYTICS_EVENT_COMMIT = 'TRACK_ANALYTICS_EVENT_COMMIT';

// We don't care about logging these anymore.
// just commit so that they don't back up on disk.
ipcRenderer.on(TRACK_ANALYTICS_EVENT, e => {
  e.sender.send(TRACK_ANALYTICS_EVENT_COMMIT);
});

global.isTab = !!global.isTab


const DiscordNative = {
  isRenderer: process.type === 'renderer',

  nativeModules: require('./discord_native/renderer/nativeModules'),
  process: require('./discord_native/renderer/process'),
  os: require('./discord_native/renderer/os'),
  app: require('./discord_native/renderer/app'),
  clipboard: require('./discord_native/renderer/clipboard'),
  ipc: ipcRenderer,
  gpuSettings: require('./discord_native/renderer/gpuSettings'),
  window: require('./discord_native/renderer/window'),
  powerMonitor: require('./discord_native/renderer/powerMonitor'),
  spellCheck: require('./discord_native/renderer/spellCheck'),
  crashReporter: require('./discord_native/renderer/crashReporter'),
  desktopCapture: require('./discord_native/renderer/desktopCapture'),
  fileManager: require('./discord_native/renderer/fileManager'),
  processUtils: require('./discord_native/renderer/processUtils'),
  powerSaveBlocker: require('./discord_native/renderer/powerSaveBlocker'),
  http: require('./discord_native/renderer/http'),
  accessibility: require('./discord_native/renderer/accessibility'),
  features: require('./discord_native/renderer/features'),
  settings: require('./discord_native/renderer/settings')
};

// TODO: remove these once web no longer uses them
DiscordNative.remoteApp = DiscordNative.app;
DiscordNative.remotePowerMonitor = DiscordNative.powerMonitor;

const BetterDiscord = require("./BetterDiscord")

const _setImmediate = setImmediate;
const _clearImmediate = clearImmediate;
process.once('loaded', () => {
  // Implementing DiscordNative
  global.DiscordNative = DiscordNative;

  // We keep these two functions in global because electron doesn't put these
  // nodejs APIs in the module scope, and these two functions
  // aren't harmful at all.
  global.setImmediate = _setImmediate;
  global.clearImmediate = _clearImmediate;

  // Since nodeIntegration has been disable
  // We're adding node propertys on window so it's easier
  // to write code / debug
  window.global = window
  global.Buffer = Buffer

  global.setImmediate = function(callback, ...args){
    return setTimeout(callback, 0, ...args);
  };
  global.clearImmediate = clearTimeout;

  const buildInfo = electron.ipcRenderer.sendSync("LIGHTCORD_GET_BUILD_INFOS")
  console.log("%c%s", "color: #3767ad;font-size:25px", 'Lightcord Client\nhttps://github.com/Lightcord/Lightcord');
  console.log("%c%s", "font-size:15px", `Version: ${buildInfo.version}\nCommit: ${buildInfo.commit || "Unknown"}`)


  let ftime = Date.now()
  BetterDiscord.init()
  BetterDiscord.events.on("debug", BetterDiscord.logger.log.bind(BetterDiscord.logger))
  BetterDiscord.events.on("ready", () => {
    BetterDiscord.logger.log("BetterDiscord Loaded. took: "+(Date.now() - ftime)+"ms.")

    try{
      // better disabling Discord's tracking request, no error in console.
      BDModules.get(e => e.AnalyticsActionHandlers)[1].AnalyticsActionHandlers.handleTrack = () => {
        return false
      }
    }catch(e){}
  })
})