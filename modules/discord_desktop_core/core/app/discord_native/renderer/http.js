'use strict';

let getAPIEndpoint = (() => {
  var _ref = _asyncToGenerator(function* () {
    const apiEndpoint = yield electron.ipcRenderer.invoke(CONSTANTS_GET, 'API_ENDPOINT');
    if (apiEndpoint == null || apiEndpoint === '') {
      return null;
    }
    return apiEndpoint;
  });

  return function getAPIEndpoint() {
    return _ref.apply(this, arguments);
  };
})();

let makeChunkedRequest = (() => {
  var _ref2 = _asyncToGenerator(function* (route, chunks, options) {
    /**
     * Given an array of chunks, make a slow request, only writing chunks
     * after a specified amount of time
     *
     * route: string
     * options: object
     *    method: the method of the request
     *    contentType: the content type of the request
     *    chunkInterval: how long to wait to upload a chunk after the last chunk was flushed
     *    token: the token to make an authorized request from
     * chunks: chunked body of the request to upload
     */

    const { method, chunkInterval, token, contentType } = options;

    let httpModule = http;
    if (route.startsWith('https')) {
      httpModule = https;
    }

    // we will force the URL to hit only API_ENDPOINT
    const apiEndpoint = yield getAPIEndpoint();
    if (apiEndpoint == null) {
      throw new Error('missing api endpoint setting');
    }

    return new Promise((() => {
      var _ref3 = _asyncToGenerator(function* (resolve, reject) {
        let writeTimeout;
        const req = httpModule.request(new URL(route, apiEndpoint).toString(), {
          method,
          headers: {
            authorization: token,
            'Content-Type': contentType,
            'Content-Length': Buffer.byteLength(chunks.join(''))
          }
        }, function (res) {
          let responseData = '';
          res.setEncoding('utf8');
          res.on('data', function (chunk) {
            responseData += chunk;
          });

          res.on('end', function () {
            resolve({ status: res.statusCode, body: responseData });
          });
        });

        req.on('error', function (e) {
          if (writeTimeout != null) {
            clearTimeout(writeTimeout);
          }
          reject(e);
        });

        for (let i = 0; i < chunks.length; i++) {
          yield new Promise(function (resolve) {
            req.write(chunks[i], function () {
              writeTimeout = setTimeout(resolve, chunkInterval);
            });
          });
        }

        req.end();
      });

      return function (_x4, _x5) {
        return _ref3.apply(this, arguments);
      };
    })());
  });

  return function makeChunkedRequest(_x, _x2, _x3) {
    return _ref2.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const electron = require('electron');
const http = require('http');
const https = require('https');
const { CONSTANTS_GET } = require('../common/constants').IPCEvents;

module.exports = {
  getAPIEndpoint,
  makeChunkedRequest: function (route, chunks, options, callback) {
    makeChunkedRequest(route, chunks, options).then(body => callback(null, body)).catch(err => callback(err));
  }
};