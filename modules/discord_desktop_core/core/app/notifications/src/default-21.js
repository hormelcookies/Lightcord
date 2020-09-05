'use strict';
var r = require('./default-0.js'), i = require('./default-22.js');
if (void 0 === r)
    throw Error('create-react-class could not find the React object. If you are using script tags, make sure that React is being loaded before create-react-class.');
var o = new r.Component().updater;
module.exports = i(r.Component, r.isValidElement, o);