'use strict';
require('./src/default-3.js');
var r = a(require('./src/default-0.js')), i = a(require('./src/default-16.js')), o = require('./src/default-20.js');
function a(e) {
    return e && e.__esModule ? e : { default: e };
}
i.default.render(r.default.createElement(o.Notifications, null), document.getElementById('notifications-mount'));