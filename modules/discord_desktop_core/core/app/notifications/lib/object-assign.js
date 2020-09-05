'use strict';
var r = Object.getOwnPropertySymbols, i = Object.prototype.hasOwnProperty, o = Object.prototype.propertyIsEnumerable;
function a(e) {
    if (null == e)
        throw new TypeError('Object.assign cannot be called with null or undefined');
    return Object(e);
}
module.exports = function () {
    try {
        if (!Object.assign)
            return !1;
        var e = new String('abc');
        if (e[5] = 'de', '5' === Object.getOwnPropertyNames(e)[0])
            return !1;
        for (var t = {}, n = 0; n < 10; n++)
            t['_' + String.fromCharCode(n)] = n;
        if ('0123456789' !== Object.getOwnPropertyNames(t).map(function (e) {
                return t[e];
            }).join(''))
            return !1;
        var r = {};
        return 'abcdefghijklmnopqrst'.split('').forEach(function (e) {
            r[e] = e;
        }), 'abcdefghijklmnopqrst' === Object.keys(Object.assign({}, r)).join('');
    } catch (e) {
        return !1;
    }
}() ? Object.assign : function (e, t) {
    for (var n, l, u = a(e), c = 1; c < arguments.length; c++) {
        for (var s in n = Object(arguments[c]))
            i.call(n, s) && (u[s] = n[s]);
        if (r) {
            l = r(n);
            for (var f = 0; f < l.length; f++)
                o.call(n, l[f]) && (u[l[f]] = n[l[f]]);
        }
    }
    return u;
};