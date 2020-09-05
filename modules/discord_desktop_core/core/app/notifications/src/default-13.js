var r, i, o = {}, a = (r = function () {
        return window && document && document.all && !window.atob;
    }, function () {
        return void 0 === i && (i = r.apply(this, arguments)), i;
    }), l = function (e) {
        var t = {};
        return function (e) {
            if (void 0 === t[e]) {
                var n = function (e) {
                    return document.querySelector(e);
                }.call(this, e);
                if (n instanceof window.HTMLIFrameElement)
                    try {
                        n = n.contentDocument.head;
                    } catch (e) {
                        n = null;
                    }
                t[e] = n;
            }
            return t[e];
        };
    }(), u = null, c = 0, s = [], f = require('./default-14.js');
function d(e, t) {
    for (var n = 0; n < e.length; n++) {
        var r = e[n], i = o[r.id];
        if (i) {
            i.refs++;
            for (var a = 0; a < i.parts.length; a++)
                i.parts[a](r.parts[a]);
            for (; a < r.parts.length; a++)
                i.parts.push(g(r.parts[a], t));
        } else {
            var l = [];
            for (a = 0; a < r.parts.length; a++)
                l.push(g(r.parts[a], t));
            o[r.id] = {
                id: r.id,
                refs: 1,
                parts: l
            };
        }
    }
}
function p(e, t) {
    for (var n = [], r = {}, i = 0; i < e.length; i++) {
        var o = e[i], a = t.base ? o[0] + t.base : o[0], l = {
                css: o[1],
                media: o[2],
                sourceMap: o[3]
            };
        r[a] ? r[a].parts.push(l) : n.push(r[a] = {
            id: a,
            parts: [l]
        });
    }
    return n;
}
function m(e, t) {
    var n = l(e.insertInto);
    if (!n)
        throw new Error('Couldn\'t find a style target. This probably means that the value for the \'insertInto\' parameter is invalid.');
    var r = s[s.length - 1];
    if ('top' === e.insertAt)
        r ? r.nextSibling ? n.insertBefore(t, r.nextSibling) : n.appendChild(t) : n.insertBefore(t, n.firstChild), s.push(t);
    else if ('bottom' === e.insertAt)
        n.appendChild(t);
    else {
        if ('object' != typeof e.insertAt || !e.insertAt.before)
            throw new Error('[Style Loader]\n\n Invalid value for parameter \'insertAt\' (\'options.insertAt\') found.\n Must be \'top\', \'bottom\', or Object.\n (https://github.com/webpack-contrib/style-loader#insertat)\n');
        var i = l(e.insertInto + ' ' + e.insertAt.before);
        n.insertBefore(t, i);
    }
}
function h(e) {
    if (null === e.parentNode)
        return !1;
    e.parentNode.removeChild(e);
    var t = s.indexOf(e);
    t >= 0 && s.splice(t, 1);
}
function v(e) {
    var t = document.createElement('style');
    return e.attrs.type = 'text/css', y(t, e.attrs), m(e, t), t;
}
function y(e, t) {
    Object.keys(t).forEach(function (n) {
        e.setAttribute(n, t[n]);
    });
}
function g(e, t) {
    var n, r, i, o;
    if (t.transform && e.css) {
        if (!(o = t.transform(e.css)))
            return function () {
            };
        e.css = o;
    }
    if (t.singleton) {
        var a = c++;
        n = u || (u = v(t)), r = k.bind(null, n, a, !1), i = k.bind(null, n, a, !0);
    } else
        e.sourceMap && 'function' == typeof URL && 'function' == typeof URL.createObjectURL && 'function' == typeof URL.revokeObjectURL && 'function' == typeof Blob && 'function' == typeof btoa ? (n = function (e) {
            var t = document.createElement('link');
            return e.attrs.type = 'text/css', e.attrs.rel = 'stylesheet', y(t, e.attrs), m(e, t), t;
        }(t), r = function (e, t, n) {
            var r = n.css, i = n.sourceMap, o = void 0 === t.convertToAbsoluteUrls && i;
            (t.convertToAbsoluteUrls || o) && (r = f(r));
            i && (r += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(i)))) + ' */');
            var a = new Blob([r], { type: 'text/css' }), l = e.href;
            e.href = URL.createObjectURL(a), l && URL.revokeObjectURL(l);
        }.bind(null, n, t), i = function () {
            h(n), n.href && URL.revokeObjectURL(n.href);
        }) : (n = v(t), r = function (e, t) {
            var n = t.css, r = t.media;
            r && e.setAttribute('media', r);
            if (e.styleSheet)
                e.styleSheet.cssText = n;
            else {
                for (; e.firstChild;)
                    e.removeChild(e.firstChild);
                e.appendChild(document.createTextNode(n));
            }
        }.bind(null, n), i = function () {
            h(n);
        });
    return r(e), function (t) {
        if (t) {
            if (t.css === e.css && t.media === e.media && t.sourceMap === e.sourceMap)
                return;
            r(e = t);
        } else
            i();
    };
}
module.exports = function (e, t) {
    if ('undefined' != typeof DEBUG && DEBUG && 'object' != typeof document)
        throw new Error('The style-loader cannot be used in a non-browser environment');
    (t = t || {}).attrs = 'object' == typeof t.attrs ? t.attrs : {}, t.singleton || (t.singleton = a()), t.insertInto || (t.insertInto = 'head'), t.insertAt || (t.insertAt = 'bottom');
    var n = p(e, t);
    return d(n, t), function (e) {
        for (var r = [], i = 0; i < n.length; i++) {
            var a = n[i];
            (l = o[a.id]).refs--, r.push(l);
        }
        e && d(p(e, t), t);
        for (i = 0; i < r.length; i++) {
            var l;
            if (0 === (l = r[i]).refs) {
                for (var u = 0; u < l.parts.length; u++)
                    l.parts[u]();
                delete o[l.id];
            }
        }
    };
};
var b, x = (b = [], function (e, t) {
        return b[e] = t, b.filter(Boolean).join('\n');
    });
function k(e, t, n, r) {
    var i = n ? '' : r.css;
    if (e.styleSheet)
        e.styleSheet.cssText = x(t, i);
    else {
        var o = document.createTextNode(i), a = e.childNodes;
        a[t] && e.removeChild(a[t]), a.length ? e.insertBefore(o, a[t]) : e.appendChild(o);
    }
}