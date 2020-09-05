'use strict';
var r = function (e) {
};
module.exports = function (e, t, n, i, o, a, l, u) {
    if (r(t), !e) {
        var c;
        if (void 0 === t)
            c = new Error('Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings.');
        else {
            var s = [
                    n,
                    i,
                    o,
                    a,
                    l,
                    u
                ], f = 0;
            (c = new Error(t.replace(/%s/g, function () {
                return s[f++];
            }))).name = 'Invariant Violation';
        }
        throw c.framesToPop = 1, c;
    }
};