'use strict';

const electron = require('electron');
const { getDiscordIPCEvent, IPCEvents } = require('../common/constants');

const ipcRenderer = electron.ipcRenderer;

// Sending ipc directly from the renderer is considered deprecated.
// App still sends a few, so we whitelist those.
let RENDERER_IPC_WHITELIST = [IPCEvents.APP_BADGE_SET, IPCEvents.CHECK_FOR_UPDATES, IPCEvents.NOTIFICATION_CLOSE, IPCEvents.NOTIFICATION_SHOW, IPCEvents.NOTIFICATIONS_CLEAR, IPCEvents.OPEN_EXTERNAL_URL, IPCEvents.QUIT_AND_INSTALL, IPCEvents.SETTINGS_UPDATE_BACKGROUND_COLOR, IPCEvents.SYSTEM_TRAY_SET_ICON, IPCEvents.SYSTEM_TRAY_SET_APPLICATIONS, IPCEvents.TOGGLE_MINIMIZE_TO_TRAY, IPCEvents.TOGGLE_OPEN_ON_STARTUP, IPCEvents.TOGGLE_START_MINIMIZED, IPCEvents.UPDATER_HISTORY_QUERY_AND_TRUNCATE, IPCEvents.UPDATED_QUOTES];
const LIGHTCORD_WHITELIST = ["NEW_TAB","UPDATE_THEME","LIGHTCORD_GET_USER_AGENT", "LIGHTCORD_SET_USER_AGENT", "LIGHTCORD_SET_BLUR_TYPE", "LIGHTCORD_SET_VIBRANCY", "LIGHTCORD_GET_APP_PATH", "LIGHTCORD_GET_PATH", "LIGHTCORD_GET_BUILD_INFOS", "LIGHTCORD_OPEN_EXTERNAL", "LIGHTCORD_SET_ALWAYS_ON_TOP", "LIGHTCORD_GET_BROWSERWINDOW_ID", "LIGHTCORD_GET_WEBCONTENTS_ID", "LIGHTCORD_GET_SETTINGS", "LIGHTCORD_SET_SETTING", "LIGHTCORD_DELETE_SETTING", "LIGHTCORD_SAVE_SETTINGS", "LIGHTCORD_REMOVE_DEVTOOLS_EXTENSION", "LIGHTCORD_ADD_DEVTOOLS_EXTENSION", "LIGHTCORD_RELAUNCH_APP", "LIGHTCORD_GET_IS_DEVTOOLS_OPEN", "LIGHTCORD_DEVTOOLS_OPEN"];


function send(ev, ...args) {
  const prefixedEvent = getDiscordIPCEvent(ev)
  console.log(prefixedEvent)
  if (!RENDERER_IPC_WHITELIST.includes(prefixedEvent)) {
    throw new Error('cannot send this event');
  }
  ipcRenderer.send(prefixedEvent, ...args);
}

function on(ev, callback) {
  ipcRenderer.on(getDiscordIPCEvent(ev), callback);
}

module.exports = {
  send,
  on
};