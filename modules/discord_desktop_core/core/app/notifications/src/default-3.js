var r = require('./default-4.js');
'string' == typeof r && (r = [[
        module.i,
        r,
        ''
    ]]);
var i = {
    hmr: !0,
    transform: void 0
};
require('./default-13.js')(r, i);
r.locals && (module.exports = r.locals);