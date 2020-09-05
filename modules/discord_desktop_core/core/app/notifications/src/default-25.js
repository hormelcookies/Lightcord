'use strict';
const r = require('./default-26.js').ipcRenderer;
module.exports = {
    send: function (e, ...t) {
        r.send(`DISCORD_${ e }`, ...t);
    },
    on: function (e, t) {
        r.on(`DISCORD_${ e }`, t);
    },
    removeListener: function (e, t) {
        r.removeListener(`DISCORD_${ e }`, t);
    }
};