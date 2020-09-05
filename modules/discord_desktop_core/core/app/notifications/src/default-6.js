module.exports = function (e) {
    var t = [];
    return t.toString = function () {
        return this.map(function (t) {
            var n = function (e, t) {
                var n = e[1] || '', r = e[3];
                if (!r)
                    return n;
                if (t && 'function' == typeof btoa) {
                    var i = (a = r, '/*# sourceMappingURL=data:application/json;charset=utf-8;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(a)))) + ' */'), o = r.sources.map(function (e) {
                            return '/*# sourceURL=' + r.sourceRoot + e + ' */';
                        });
                    return [n].concat(o).concat([i]).join('\n');
                }
                var a;
                return [n].join('\n');
            }(t, e);
            return t[2] ? '@media ' + t[2] + '{' + n + '}' : n;
        }).join('');
    }, t.i = function (e, n) {
        'string' == typeof e && (e = [[
                null,
                e,
                ''
            ]]);
        for (var r = {}, i = 0; i < this.length; i++) {
            var o = this[i][0];
            'number' == typeof o && (r[o] = !0);
        }
        for (i = 0; i < e.length; i++) {
            var a = e[i];
            'number' == typeof a[0] && r[a[0]] || (n && !a[2] ? a[2] = n : n && (a[2] = '(' + a[2] + ') and (' + n + ')'), t.push(a));
        }
    }, t;
};