// LSSB Applicant Notification Panel
(function () {
    'use strict';
    var BASE_URL = 'https://apix.lagosscholarship.org';
    var ENDPOINT = BASE_URL + '/endpoint/LSSB_users';
    var AUTH_KEY = 'bk_app_18_u_auth';
    var _notifications = [];
    var _panelOpen = false;
    var _panel = null;
    var _badge = null;

    function getSession() {
        try { var raw = localStorage.getItem(AUTH_KEY); return raw ? JSON.parse(raw) : null; }
        catch (e) { return null; }
    }

    function apiCall(action, cb) {
        var session = getSession();
        if (!session || !session['$k']) return cb && cb(null);
        fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cloud_action: action, '$k': session['$k'] })
        }).then(function (r) { return r.json(); }).then(function (d) { cb && cb(d); }).catch(function () { cb && cb(null); });
    }

    function timeAgo(ts) {
        var diff = Date.now() - ts;
        var m = Math.floor(diff / 60000);
        if (m < 1) return 'Just now';
        if (m < 60) return m + 'm ago';
        var h = Math.floor(m / 60);
        if (h < 24) return h + 'h ago';
        return Math.floor(h / 24) + 'd ago';
    }

    function updateBadge(count) {
        if (!_badge) return;
        if (count > 0) { _badge.textContent = count > 99 ? '99+' : count; _badge.style.display = 'flex'; }
        else { _badge.style.display = 'none'; }
    }

    function renderPanel(notifs) {
        if (!_panel) return;
        var header = _panel.querySelector('#lssb-ph');
        var body = _panel.querySelector('#lssb-pb');
        if (!body) return;
        if (!notifs || notifs.length === 0) {
            body.innerHTML = '<div style="padding:32px 16px;text-align:center;color:#888;font-size:13px;">No notifications yet</div>';
            return;
        }
        body.innerHTML = notifs.map(function (n) {
            var unread = !n.is_read;
            return '<div style="display:flex;gap:10px;padding:12px 16px;background:' + (unread ? '#f0faf4' : '#fff') + ';border-bottom:1px solid #f0f0f0;">' +
                '<span style="width:8px;height:8px;border-radius:50%;background:' + (unread ? '#007A3D' : 'transparent') + ';flex-shrink:0;margin-top:5px;display:inline-block;"></span>' +
                '<div><p style="margin:0 0 3px;font-size:13px;color:#1a1a1a;line-height:1.4;">' + (n.message || '') + '</p>' +
                '<p style="margin:0;font-size:11px;color:#999;">' + (n.application_num ? 'Ref: ' + n.application_num + ' &bull; ' : '') + timeAgo(n.created_at || 0) + '</p></div></div>';
        }).join('');
    }

    function fetchNotifs() {
        apiCall('fetch_notifications', function (data) {
            if (data && data.data) {
                _notifications = data.data.notifications || [];
                renderPanel(_notifications);
                updateBadge(data.data.unread_count || 0);
            }
        });
    }

    function markRead() {
        apiCall('mark_notifications_read', function () {
            _notifications = _notifications.map(function (n) { return Object.assign({}, n, { is_read: true }); });
            renderPanel(_notifications);
            updateBadge(0);
        });
    }

    function togglePanel() {
        _panelOpen = !_panelOpen;
        if (_panel) {
            _panel.style.display = _panelOpen ? 'block' : 'none';
            if (_panelOpen) { markRead(); fetchNotifs(); }
        }
    }

    function init() {
        var session = getSession();
        if (!session || !session['$k']) return;

        var wrap = document.createElement('div');
        wrap.style.cssText = 'position:fixed;top:16px;right:16px;z-index:99999;';

        var bell = document.createElement('button');
        bell.style.cssText = 'position:relative;width:44px;height:44px;border-radius:50%;border:none;background:#007A3D;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.25);outline:none;';
        bell.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';

        _badge = document.createElement('span');
        _badge.style.cssText = 'position:absolute;top:-4px;right:-4px;min-width:18px;height:18px;border-radius:9px;background:#e53e3e;color:#fff;font-size:10px;font-weight:700;display:none;align-items:center;justify-content:center;padding:0 4px;border:2px solid #fff;';
        bell.appendChild(_badge);

        _panel = document.createElement('div');
        _panel.style.cssText = 'display:none;position:absolute;top:52px;right:0;width:320px;max-height:440px;overflow-y:auto;background:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.18);border:1px solid #e8e8e8;';
        _panel.innerHTML = '<div id="lssb-ph" style="padding:14px 16px 10px;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:#fff;z-index:1;"><span style="font-weight:700;font-size:15px;color:#1a1a1a;">Notifications</span><span id="lssb-pc" style="cursor:pointer;color:#999;font-size:22px;line-height:1;">&times;</span></div><div id="lssb-pb"><div style="padding:32px 16px;text-align:center;color:#bbb;font-size:13px;">Loading...</div></div>';

        wrap.appendChild(bell);
        wrap.appendChild(_panel);
        document.body.appendChild(wrap);

        bell.addEventListener('click', function (e) { e.stopPropagation(); togglePanel(); });
        document.addEventListener('click', function (e) {
            if (_panelOpen && !wrap.contains(e.target)) { _panelOpen = false; _panel.style.display = 'none'; }
        });
        _panel.addEventListener('click', function (e) {
            if (e.target && e.target.id === 'lssb-pc') { _panelOpen = false; _panel.style.display = 'none'; }
        });

        fetchNotifs();
        setInterval(function () { if (!_panelOpen) fetchNotifs(); }, 60000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 1500); });
    } else {
        setTimeout(init, 1500);
    }
})();
