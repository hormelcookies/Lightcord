module.exports = function (e) {
    var t = 'undefined' != typeof window && window.location;
    if (!t)
        throw new Error('fixUrls requires window.location');
    if (!e || 'string' != typeof e)
        return e;
    var n = t.protocol + '//' + t.host, r = n + t.pathname.replace(/\/[^\/]*$/, '/');
    return e.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function (e, t) {
        var i, o = t.trim().replace(/^"(.*)"$/, function (e, t) {
                return t;
            }).replace(/^'(.*)'$/, function (e, t) {
                return t;
            });
        return /^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(o) ? e : (i = 0 === o.indexOf('//') ? o : 0 === o.indexOf('/') ? n + o : r + o.replace(/^\.\//, ''), 'url(' + JSON.stringify(i) + ')');
    });
};