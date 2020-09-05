'use strict';
Object.defineProperty(exports, '__esModule', { value: !0 }), exports.Notifications = void 0;
var r = Object.assign || function (e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
                Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
        }
        return e;
    }, i = l(require('./default-0.js')), o = l(require('./default-21.js')), a = l(require('./default-25.js'));
function l(e) {
    return e && e.__esModule ? e : { default: e };
}
const u = 'NOTIFICATION_CLICK', c = 'NOTIFICATION_CLOSE', s = (0, o.default)({
        displayName: 'Notification',
        getInitialState: () => ({ className: 'in' }),
        handeClick() {
            this.props.onClick(this.props.id);
        },
        handleDismiss(e) {
            e.preventDefault(), e.stopPropagation(), this.props.onDismiss(this.props.id);
        },
        componentWillReceiveProps(e) {
            !0 === e.fadeMeOut && this.setState({ className: 'out' });
        },
        render() {
            return i.default.createElement('div', {
                className: 'notification ' + this.state.className + ' theme-' + this.props.theme,
                onClick: this.handeClick
            }, i.default.createElement('button', {
                type: 'button',
                className: 'notification-dismiss',
                onClick: this.handleDismiss
            }), i.default.createElement('div', { className: 'notification-contents' }, i.default.createElement('div', {
                className: 'notification-icon',
                style: { backgroundImage: `url('${ this.props.icon }')` }
            }), i.default.createElement('div', { className: 'notification-body' }, i.default.createElement('header', null, this.props.title), i.default.createElement('p', { className: 'notif-text theme-' + this.props.theme }, truncateString(this.props.body, 40)))), i.default.createElement('div', { className: 'notification-logo' }));
        }
    }), f = (0, o.default)({
        displayName: 'Notifications',
        getInitialState: () => ({
            notifications: [],
            theme: 'dark'
        }),
        handleUpdateEvent(e, t) {
            this.setState({ notifications: t });
        },
        handleFadeOut(e, t) {
            const n = this.state.notifications.map(e => {
                if (e.id == t) {
                    const t = r({}, e);
                    return t.fadeMeOut = !0, t;
                }
                return e;
            });
            this.setState({ notifications: n });
        },
        handleUpdateTheme(e, theme) {
            this.setState({ theme: theme });
        },
        componentDidMount() {
            a.default.on('UPDATE_THEME', this.handleUpdateTheme), a.default.on('UPDATE', this.handleUpdateEvent), a.default.on('FADE_OUT', this.handleFadeOut);
        },
        componentWillUnmount() {
            a.default.removeListener('UPDATE_THEME', this.handleUpdateTheme), a.default.removeListener('UPDATE', this.handleUpdateEvent), a.default.removeListener('FADE_OUT', this.handleFadeOut);
        },
        handleNotificationClick(e) {
            a.default.send(u, e);
        },
        handleNotificationDismiss(e) {
            a.default.send(c, e);
        },
        render() {
            const e = this.state.notifications.map(e => i.default.createElement(s, r({}, e, {
                key: e.id,
                onClick: this.handleNotificationClick,
                onDismiss: this.handleNotificationDismiss,
                theme: this.state.theme
            })));
            return i.default.createElement('div', { id: 'notifications' }, e);
        }
    });
exports.Notifications = f;
function truncateString(str, num) {
    if (str.length <= num) {
        return str;
    }
    return str.slice(0, num) + '...';
}