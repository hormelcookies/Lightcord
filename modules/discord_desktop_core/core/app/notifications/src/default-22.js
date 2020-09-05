'use strict';
var r = require('./../lib/object-assign.js'), i = require('./default-23.js'), o = require('./default-24.js'), a = 'mixins';
module.exports = function (e, t, n) {
    var l = [], u = {
            mixins: 'DEFINE_MANY',
            statics: 'DEFINE_MANY',
            propTypes: 'DEFINE_MANY',
            contextTypes: 'DEFINE_MANY',
            childContextTypes: 'DEFINE_MANY',
            getDefaultProps: 'DEFINE_MANY_MERGED',
            getInitialState: 'DEFINE_MANY_MERGED',
            getChildContext: 'DEFINE_MANY_MERGED',
            render: 'DEFINE_ONCE',
            componentWillMount: 'DEFINE_MANY',
            componentDidMount: 'DEFINE_MANY',
            componentWillReceiveProps: 'DEFINE_MANY',
            shouldComponentUpdate: 'DEFINE_ONCE',
            componentWillUpdate: 'DEFINE_MANY',
            componentDidUpdate: 'DEFINE_MANY',
            componentWillUnmount: 'DEFINE_MANY',
            UNSAFE_componentWillMount: 'DEFINE_MANY',
            UNSAFE_componentWillReceiveProps: 'DEFINE_MANY',
            UNSAFE_componentWillUpdate: 'DEFINE_MANY',
            updateComponent: 'OVERRIDE_BASE'
        }, c = { getDerivedStateFromProps: 'DEFINE_MANY_MERGED' }, s = {
            displayName: function (e, t) {
                e.displayName = t;
            },
            mixins: function (e, t) {
                if (t)
                    for (var n = 0; n < t.length; n++)
                        d(e, t[n]);
            },
            childContextTypes: function (e, t) {
                e.childContextTypes = r({}, e.childContextTypes, t);
            },
            contextTypes: function (e, t) {
                e.contextTypes = r({}, e.contextTypes, t);
            },
            getDefaultProps: function (e, t) {
                e.getDefaultProps ? e.getDefaultProps = m(e.getDefaultProps, t) : e.getDefaultProps = t;
            },
            propTypes: function (e, t) {
                e.propTypes = r({}, e.propTypes, t);
            },
            statics: function (e, t) {
                !function (e, t) {
                    if (t)
                        for (var n in t) {
                            var r = t[n];
                            if (t.hasOwnProperty(n)) {
                                var i = n in s;
                                o(!i, 'ReactClass: You are attempting to define a reserved property, `%s`, that shouldn\'t be on the "statics" key. Define it as an instance property instead; it will still be accessible on the constructor.', n);
                                var a = n in e;
                                if (a) {
                                    var l = c.hasOwnProperty(n) ? c[n] : null;
                                    return o('DEFINE_MANY_MERGED' === l, 'ReactClass: You are attempting to define `%s` on your component more than once. This conflict may be due to a mixin.', n), void (e[n] = m(e[n], r));
                                }
                                e[n] = r;
                            }
                        }
                }(e, t);
            },
            autobind: function () {
            }
        };
    function f(e, t) {
        var n = u.hasOwnProperty(t) ? u[t] : null;
        b.hasOwnProperty(t) && o('OVERRIDE_BASE' === n, 'ReactClassInterface: You are attempting to override `%s` from your class specification. Ensure that your method names do not overlap with React methods.', t), e && o('DEFINE_MANY' === n || 'DEFINE_MANY_MERGED' === n, 'ReactClassInterface: You are attempting to define `%s` on your component more than once. This conflict may be due to a mixin.', t);
    }
    function d(e, n) {
        if (n) {
            o('function' != typeof n, 'ReactClass: You\'re attempting to use a component class or function as a mixin. Instead, just use a regular object.'), o(!t(n), 'ReactClass: You\'re attempting to use a component as a mixin. Instead, just use a regular object.');
            var r = e.prototype, i = r.__reactAutoBindPairs;
            for (var l in (n.hasOwnProperty(a) && s.mixins(e, n.mixins), n))
                if (n.hasOwnProperty(l) && l !== a) {
                    var c = n[l], d = r.hasOwnProperty(l);
                    if (f(d, l), s.hasOwnProperty(l))
                        s[l](e, c);
                    else {
                        var p = u.hasOwnProperty(l);
                        if ('function' != typeof c || p || d || !1 === n.autobind)
                            if (d) {
                                var v = u[l];
                                o(p && ('DEFINE_MANY_MERGED' === v || 'DEFINE_MANY' === v), 'ReactClass: Unexpected spec policy %s for key %s when mixing in component specs.', v, l), 'DEFINE_MANY_MERGED' === v ? r[l] = m(r[l], c) : 'DEFINE_MANY' === v && (r[l] = h(r[l], c));
                            } else
                                r[l] = c;
                        else
                            i.push(l, c), r[l] = c;
                    }
                }
        }
    }
    function p(e, t) {
        for (var n in (o(e && t && 'object' == typeof e && 'object' == typeof t, 'mergeIntoWithNoDuplicateKeys(): Cannot merge non-objects.'), t))
            t.hasOwnProperty(n) && (o(void 0 === e[n], 'mergeIntoWithNoDuplicateKeys(): Tried to merge two objects with the same key: `%s`. This conflict may be due to a mixin; in particular, this may be caused by two getInitialState() or getDefaultProps() methods returning objects with clashing keys.', n), e[n] = t[n]);
        return e;
    }
    function m(e, t) {
        return function () {
            var n = e.apply(this, arguments), r = t.apply(this, arguments);
            if (null == n)
                return r;
            if (null == r)
                return n;
            var i = {};
            return p(i, n), p(i, r), i;
        };
    }
    function h(e, t) {
        return function () {
            e.apply(this, arguments), t.apply(this, arguments);
        };
    }
    function v(e, t) {
        return t.bind(e);
    }
    var y = {
            componentDidMount: function () {
                this.__isMounted = !0;
            }
        }, g = {
            componentWillUnmount: function () {
                this.__isMounted = !1;
            }
        }, b = {
            replaceState: function (e, t) {
                this.updater.enqueueReplaceState(this, e, t);
            },
            isMounted: function () {
                return !!this.__isMounted;
            }
        }, x = function () {
        };
    return r(x.prototype, e.prototype, b), function (e) {
        var t = function (e, r, a) {
            this.__reactAutoBindPairs.length && function (e) {
                for (var t = e.__reactAutoBindPairs, n = 0; n < t.length; n += 2) {
                    var r = t[n], i = t[n + 1];
                    e[r] = v(e, i);
                }
            }(this), this.props = e, this.context = r, this.refs = i, this.updater = a || n, this.state = null;
            var l = this.getInitialState ? this.getInitialState() : null;
            o('object' == typeof l && !Array.isArray(l), '%s.getInitialState(): must return an object or null', t.displayName || 'ReactCompositeComponent'), this.state = l;
        };
        for (var r in (t.prototype = new x(), t.prototype.constructor = t, t.prototype.__reactAutoBindPairs = [], l.forEach(d.bind(null, t)), d(t, y), d(t, e), d(t, g), t.getDefaultProps && (t.defaultProps = t.getDefaultProps()), o(t.prototype.render, 'createClass(...): Class specification must implement a `render` method.'), u))
            t.prototype[r] || (t.prototype[r] = null);
        return t;
    };
};