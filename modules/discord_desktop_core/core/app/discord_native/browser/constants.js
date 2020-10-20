'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const electron = require('electron');
const { CONSTANTS_GET } = require('../common/constants').IPCEvents;
const { APP_NAME, APP_ID, API_ENDPOINT, UPDATE_ENDPOINT } = require('../../Constants');

const exposedConstants = {
  APP_NAME,
  APP_ID,
  API_ENDPOINT,
  UPDATE_ENDPOINT
};

electron.ipcMain.handle(CONSTANTS_GET, (() => {
  var _ref = _asyncToGenerator(function* (_, name) {
    if (!exposedConstants.hasOwnProperty(name)) {
      return undefined;
    }
    return exposedConstants[name];
  });

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
})());