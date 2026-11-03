window.__ModuleLoader__.load({
  id: 'dsh-amdkey',
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    var React = require('react');

    var API = '/amdkey/api';

    var CSS = ''
      + '.ak-wrap *,.ak-wrap *::before,.ak-wrap *::after{box-sizing:border-box;}'
      + '.ak-wrap{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;color:#e6edf3;display:flex;flex-direction:column;gap:14px;height:100%;min-height:0;padding:16px var(--amdkey-gutter,80px) 16px;overflow:hidden;box-sizing:border-box;width:100%;}'
      + '.ak-subtabs{display:flex;gap:2px;border-bottom:1px solid #21262d;flex:none;}'
      + '.ak-subtab{padding:7px 14px;font-size:12px;color:#8b949e;border-bottom:2px solid transparent;cursor:pointer;transition:all .15s;}'
      + '.ak-subtab:hover{color:#e6edf3;}'
      + '.ak-subtab.active{color:#e6edf3;border-bottom-color:#58a6ff;}'
      + '.ak-statusbar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;flex:none;padding-right:8px;}'
      + '.ak-status-left{display:flex;align-items:center;gap:8px;}'
      + '.ak-dot{width:8px;height:8px;border-radius:50%;background:#3fb950;box-shadow:0 0 8px rgba(63,185,80,.6);}'
      + '.ak-dot.warn{background:#d29922;box-shadow:0 0 8px rgba(210,153,34,.6);}'
      + '.ak-dot.bad{background:#f85149;box-shadow:0 0 8px rgba(248,81,73,.6);}'
      + '.ak-status-text{font-size:13px;font-weight:600;}'
      + '.ak-status-sub{font-size:11px;color:#8b949e;}'
      + '.ak-status-right{display:flex;gap:8px;}'
      + '.ak-btn{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:#161b22;border:1px solid #30363d;border-radius:6px;color:#e6edf3;font-size:12px;cursor:pointer;transition:all .15s;font-family:inherit;}'
      + '.ak-btn:hover{background:#1c2128;border-color:#484f58;}'
      + '.ak-btn.primary{background:#238636;border-color:#2ea043;}'
      + '.ak-btn.primary:hover{background:#2ea043;}'
      + '.ak-btn.small{padding:4px 10px;font-size:11px;}'
      + '.ak-btn:disabled{opacity:.4;cursor:default;}'
      + '.ak-btn svg{width:13px;height:13px;}'
      + '.ak-stats{display:flex;gap:20px;padding:10px 14px;background:#161b22;border:1px solid #21262d;border-radius:6px;font-size:12px;flex-wrap:wrap;align-items:center;flex:none;margin-right:8px;}'
      + '.ak-stat{display:flex;flex-direction:column;gap:2px;}'
      + '.ak-stat-label{color:#8b949e;font-size:11px;}'
      + '.ak-stat-value{font-weight:600;font-size:13px;}'
      + '.ak-stat-value.ok{color:#3fb950;}'
      + '.ak-stat-value.warn{color:#d29922;}'
      + '.ak-stat-value.bad{color:#f85149;}'
      + '.ak-keylist{display:flex;flex-direction:column;gap:6px;flex:1 1 auto;min-height:0;max-height:228px;overflow-y:auto;overflow-x:hidden;scrollbar-gutter:stable;}'
      + '.ak-keylist::-webkit-scrollbar{width:8px;}'
      + '.ak-keylist::-webkit-scrollbar-thumb{background:transparent;border-radius:4px;}.ak-keylist:hover::-webkit-scrollbar-thumb{background:#30363d;}'
      + '.ak-keyrow{display:grid;grid-template-columns:minmax(0,1fr) auto 160px 66px;align-items:center;gap:10px;padding:8px 14px;background:#161b22;border:1px solid #21262d;border-radius:6px;font-size:12px;transition:border-color .15s;}'
      + '.ak-keyrow:hover{border-color:#30363d;}'
      + '.ak-keyrow.cooling{background:#1c1611;border-color:#3d2e1a;}'
      + '.ak-keyrow.exhausted{background:#1c1114;border-color:#3d1a1e;opacity:.75;}'
      + '.ak-keymain{display:flex;flex-direction:column;gap:2px;min-width:0;}'
      + '.ak-keyline{display:flex;align-items:center;gap:6px;min-width:0;}'
      + '.ak-keyidx{font-family:ui-monospace,Consolas,monospace;font-size:15px;font-weight:400;color:#58a6ff;width:32px;text-align:center;flex:none;line-height:1;}'
      + '.ak-keyname{font-family:ui-monospace,"Cascadia Code",Consolas,monospace;font-size:12px;color:#e6edf3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;}'
      + '.ak-keyname.masked{color:#8b949e;}'
      + '.ak-iconbar{display:flex;align-items:center;gap:2px;flex:none;width:44px;justify-content:flex-end;}'
      + '.ak-iconbtn{background:none;border:none;color:#6e7681;cursor:pointer;padding:3px;display:flex;align-items:center;justify-content:center;border-radius:3px;transition:color .15s,background .15s;width:20px;height:20px;flex:none;}'
      + '.ak-iconbtn:hover{color:#58a6ff;background:rgba(88,166,255,.1);}'
      + '.ak-iconbtn.copied{color:#3fb950;}'
      + '.ak-iconbtn svg{width:13px;height:13px;}'
      + '.ak-keymeta{font-size:10px;color:#6e7681;}'
      + '.ak-badge{padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;white-space:nowrap;}'
      + '.ak-badge.ok{background:rgba(63,185,80,.15);color:#3fb950;}'
      + '.ak-badge.cooling{background:rgba(210,153,34,.15);color:#d29922;}'
      + '.ak-badge.exhausted{background:rgba(248,81,73,.15);color:#f85149;}'
      + '.ak-usage{display:flex;align-items:center;gap:8px;width:160px;flex:none;justify-content:flex-end;}'
      + '.ak-ring{position:relative;width:34px;height:34px;flex:none;}'
      + '.ak-ring svg{transform:rotate(-90deg);display:block;}'
      + '.ak-ring-bg{fill:none;stroke:#21262d;stroke-width:3.5;}'
      + '.ak-ring-fg{fill:none;stroke:#3fb950;stroke-width:3.5;stroke-linecap:round;transition:stroke-dashoffset .4s;}'
      + '.ak-ring-fg.warn{stroke:#d29922;}'
      + '.ak-ring-fg.bad{stroke:#f85149;}'
      + '.ak-ring-txt{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#8b949e;}'
      + '.ak-usage-num{font-family:ui-monospace,Consolas,monospace;font-size:11px;color:#8b949e;min-width:46px;text-align:right;}'
      + '.ak-actions{display:flex;justify-content:flex-end;width:66px;flex:none;}'
      + '.ak-del{background:none;border:none;color:#6e7681;cursor:pointer;padding:3px;border-radius:4px;display:flex;font-size:15px;line-height:1;width:20px;height:20px;align-items:center;justify-content:center;}'
      + '.ak-del:hover{color:#f85149;background:rgba(248,81,73,.1);}'
      + '.ak-addarea{border-top:1px solid #21262d;padding-top:14px;display:flex;flex-direction:column;gap:10px;flex:none;padding-right:8px;}'
      + '.ak-textarea{width:100%;min-height:72px;background:#0d1117;border:1px solid #30363d;border-radius:6px;color:#e6edf3;font-family:ui-monospace,Consolas,monospace;font-size:12px;padding:10px 12px;resize:vertical;outline:none;line-height:1.6;}'
      + '.ak-textarea:focus{border-color:#58a6ff;}'
      + '.ak-textarea::placeholder{color:#484f58;}'      + '.ak-textarea::-webkit-scrollbar{width:6px;}'      + '.ak-textarea::-webkit-scrollbar-track{background:transparent;}'      + '.ak-textarea::-webkit-scrollbar-thumb{background:transparent;border-radius:3px;}'      + '.ak-textarea:hover::-webkit-scrollbar-thumb{background:#30363d;}'
      + '.ak-addfooter{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;}'
      + '.ak-addhint{font-size:11px;color:#6e7681;}'
      + '.ak-settings{display:flex;gap:16px;align-items:center;padding-top:12px;border-top:1px solid #21262d;font-size:11px;color:#8b949e;flex-wrap:wrap;flex:none;padding-right:8px;}'
      + '.ak-field{display:flex;align-items:center;gap:6px;}'
      + '.ak-field input{width:64px;background:#0d1117;border:1px solid #30363d;border-radius:4px;color:#e6edf3;padding:4px 6px;font-size:11px;font-family:inherit;}'
      + '.ak-field input:focus{outline:none;border-color:#58a6ff;}'
      + '.ak-savebtn{margin-left:auto;padding:5px 14px;background:#21262d;border:1px solid #30363d;border-radius:5px;color:#8b949e;font-size:11px;cursor:pointer;font-family:inherit;transition:all .15s;}'
      + '.ak-savebtn.dirty{background:#238636;border-color:#2ea043;color:#fff;}'
      + '.ak-savebtn.dirty:hover{background:#2ea043;}'
      + '.ak-savestate{font-size:10px;color:#3fb950;margin-left:6px;}'
      + '.ak-creditgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;flex:none;}'      + '.ak-creditcard{padding:12px 14px;background:#161b22;border:1px solid #21262d;border-radius:6px;display:flex;flex-direction:column;gap:6px;}'      + '.ak-clabel{font-size:11px;color:#8b949e;}'      + '.ak-cvalue{font-size:20px;font-weight:600;font-family:ui-monospace,Consolas,monospace;}'      + '.ak-cvalue.ok{color:#3fb950;}'      + '.ak-cunit{font-size:11px;color:#6e7681;margin-left:3px;font-weight:400;}'      + '.ak-cnote{font-size:10px;color:#6e7681;}'      + '.ak-barwrap{display:flex;flex-direction:column;gap:6px;flex:none;}'      + '.ak-bar{height:8px;background:#21262d;border-radius:4px;overflow:hidden;}'      + '.ak-barfill{height:100%;background:linear-gradient(90deg,#3fb950,#2ea043);border-radius:4px;transition:width .4s;}'      + '.ak-barfill.warn{background:linear-gradient(90deg,#d29922,#bb8009);}'      + '.ak-barfill.bad{background:linear-gradient(90deg,#f85149,#da3633);}'      + '.ak-barmeta{display:flex;justify-content:space-between;font-size:11px;color:#6e7681;}'      + '.ak-resetnote{font-size:11px;color:#6e7681;}'      + '.ak-empty{text-align:center;padding:40px 20px;color:#6e7681;font-size:12px;line-height:1.8;}'
      + '.ak-wrap-models{padding-top:0;overflow-y:auto;}'
      + '.ak-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 14px;background:#161b22;border:1px solid #21262d;border-radius:6px;flex:none;flex-wrap:wrap;margin-right:8px;}'
      + '.ak-toolbar-left{display:flex;align-items:center;gap:10px;font-size:12px;}'
      + '.ak-toolbar-right{display:flex;gap:8px;align-items:center;}'
      + '.ak-count{padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;background:rgba(88,166,255,.15);color:#58a6ff;}'
      + '.ak-search{background:#0d1117;border:1px solid #30363d;border-radius:6px;color:#e6edf3;font-size:12px;padding:5px 10px;width:180px;font-family:inherit;outline:none;}'
      + '.ak-search:focus{border-color:#58a6ff;}'
      + '.ak-search::placeholder{color:#484f58;}'
      + '.ak-modellist{display:flex;flex-direction:column;gap:6px;overflow-y:auto;max-height:360px;flex:none;}'
      + '.ak-modellist::-webkit-scrollbar{width:8px;}'
      + '.ak-modellist::-webkit-scrollbar-thumb{background:#30363d;border-radius:4px;}'
      + '.ak-modelrow{display:grid;grid-template-columns:auto minmax(0,1fr) auto auto;align-items:center;gap:12px;padding:9px 14px;background:#161b22;border:1px solid #21262d;border-radius:6px;font-size:12px;transition:all .15s;cursor:pointer;}'
      + '.ak-modelrow:hover{border-color:#30363d;background:#1c2128;}'
      + '.ak-modelrow.selected{background:#0d1a26;border-color:#1f6feb;}'
      + '.ak-modelrow.disabled{opacity:.55;}'
      + '.ak-cb{width:16px;height:16px;border-radius:4px;flex:none;border:1.5px solid #484f58;background:#0d1117;display:flex;align-items:center;justify-content:center;transition:all .15s;}'
      + '.ak-modelrow.selected .ak-cb{background:#1f6feb;border-color:#388bfd;}'
      + '.ak-cb svg{width:11px;height:11px;opacity:0;transition:opacity .15s;}'
      + '.ak-modelrow.selected .ak-cb svg{opacity:1;}'
      + '.ak-modelmain{display:flex;flex-direction:column;gap:3px;min-width:0;}'
      + '.ak-modelname{font-family:ui-monospace,"Cascadia Code",Consolas,monospace;font-size:12px;color:#e6edf3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'
      + '.ak-modelmeta{font-size:10px;color:#6e7681;display:flex;gap:6px;flex-wrap:wrap;}'
      + '.ak-tag{padding:1px 6px;border-radius:3px;background:#21262d;color:#8b949e;}'
      + '.ak-tag.vision{background:rgba(63,185,80,.12);color:#3fb950;}'
      + '.ak-tag.reason{background:rgba(163,113,247,.12);color:#a371f7;}'
      + '.ak-tag.warn{background:rgba(210,153,34,.12);color:#d29922;}'
      + '.ak-ctx{font-family:ui-monospace,Consolas,monospace;font-size:11px;color:#8b949e;white-space:nowrap;}'
      + '.ak-efforts{font-size:10px;color:#6e7681;white-space:nowrap;max-width:140px;overflow:hidden;text-overflow:ellipsis;}'
      + '.ak-savebar{display:flex;align-items:center;gap:12px;padding-top:12px;border-top:1px solid #21262d;flex:none;flex-wrap:wrap;padding-right:8px;}'
      + '.ak-savehint{font-size:11px;color:#6e7681;}'
      + '.ak-spacer{margin-left:auto;}'
      + '.ak-applybtn{padding:6px 16px;border-radius:6px;font-size:12px;font-family:inherit;border:1px solid #30363d;background:#21262d;color:#8b949e;cursor:default;transition:all .15s;}'
      + '.ak-applybtn.dirty{background:#238636;border-color:#2ea043;color:#fff;cursor:pointer;}'
      + '.ak-applybtn.dirty:hover{background:#2ea043;}';

    var EYE_OPEN = React.createElement('svg', { viewBox: '0 0 16 16', fill: 'currentColor' },
      React.createElement('path', { d: 'M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z' }),
      React.createElement('path', { d: 'M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z' }));
    var EYE_OFF = React.createElement('svg', { viewBox: '0 0 16 16', fill: 'currentColor' },
      React.createElement('path', { d: 'M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z' }),
      React.createElement('path', { d: 'M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z' }),
      React.createElement('path', { d: 'M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z' }));
    var COPY_ICON = React.createElement('svg', { viewBox: '0 0 16 16', fill: 'currentColor' },
      React.createElement('path', { d: 'M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25v-7.5z' }),
      React.createElement('path', { d: 'M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25v-7.5zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25h-7.5z' }));
    var CHECK_ICON = React.createElement('svg', { viewBox: '0 0 16 16', fill: '#fff' },
      React.createElement('path', { d: 'M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z' }));
    var REVIVE_ICON = React.createElement('svg', { viewBox: '0 0 16 16', fill: 'currentColor' },
      React.createElement('path', { d: 'M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z' }),
      React.createElement('path', { d: 'M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z' }));
    var REFRESH_ICON = React.createElement('svg', { viewBox: '0 0 16 16', fill: 'currentColor' },
      React.createElement('path', { d: 'M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z' }),
      React.createElement('path', { d: 'M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z' }));

    function formatTokens(n) {
      if (!n) return '0';
      if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
      if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
      return String(n);
    }
    function formatPts(n) {
      const v = Number(n) || 0;
      return v.toFixed(4);
    }
    function formatResetIn(epoch) {
      if (!epoch) return '';
      const ms = epoch * 1000 - Date.now();
      if (ms <= 0) return '即将重置';
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      return h > 0 ? `还有 ${h} 小时 ${m} 分` : `还有 ${m} 分`;
    }
    function formatCtx(n) {
      if (!n) return '—';
      if (n >= 1048576) return Math.round(n / 1048576) + 'M';
      if (n >= 1024) return Math.round(n / 1024) + 'K';
      return String(n);
    }
    function formatRemain(until) {
      var ms = until - Date.now();
      if (ms <= 0) return '即将恢复';
      var h = Math.floor(ms / 3600000);
      var m = Math.floor((ms % 3600000) / 60000);
      if (h > 0) return '冷却剩余 ' + h + ' 小时 ' + m + ' 分';
      return '冷却剩余 ' + m + ' 分';
    }
    function formatLastUsed(ts) {
      if (!ts) return '尚未使用';
      var s = Math.floor((Date.now() - ts) / 1000);
      if (s < 60) return '最后使用 ' + s + ' 秒前';
      if (s < 3600) return '最后使用 ' + Math.floor(s / 60) + ' 分钟前';
      return '最后使用 ' + Math.floor(s / 3600) + ' 小时前';
    }
    // 环形显示「今日剩余」比例：满环 = 额度充足，空环 = 快用完。
    // 颜色随剩余量反向走 —— 剩得多是绿的，剩得少才变黄变红。
    function ringOf(usedRatio) {
      var used = Math.min(1, Math.max(0, Number(usedRatio) || 0));
      var remainPct = Math.round((1 - used) * 100);
      var C = 2 * Math.PI * 14;
      // 剩余 <= 10% 红，<= 40% 黄，其余绿
      var color = remainPct <= 10 ? 'bad' : remainPct <= 40 ? 'warn' : '';
      return { pct: remainPct, offset: C - (C * remainPct / 100), C: C, color: color };
    }
    function apiGet(path) {
      return fetch(API + path, { credentials: 'same-origin' }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      });
    }
    function apiPost(path, body) {
      return fetch(API + path, {
        method: 'POST', credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body || {}),
      }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      });
    }

    function Panel() {
      var tabArr = React.useState('keys');
      var tab = tabArr[0], setTab = tabArr[1];

      var snapArr = React.useState(null);
      var snap = snapArr[0], setSnap = snapArr[1];

      var errArr = React.useState('');
      var error = errArr[0], setError = errArr[1];

      var loadArr = React.useState(true);
      var loading = loadArr[0], setLoading = loadArr[1];

      var inputArr = React.useState('');
      var input = inputArr[0], setInput = inputArr[1];

      var revealedArr = React.useState({});
      var revealed = revealedArr[0], setRevealed = revealedArr[1];

      var copiedArr = React.useState({});
      var copied = copiedArr[0], setCopied = copiedArr[1];

      var coolArr = React.useState('24');
      var cool = coolArr[0], setCool = coolArr[1];

      var portArr = React.useState('18888');
      var port = portArr[0], setPort = portArr[1];

      var savedArr = React.useState({ cooldownHours: 24, port: 18888 });
      var saved = savedArr[0], setSaved = savedArr[1];

      var saveStateArr = React.useState('');
      var saveState = saveStateArr[0], setSaveState = saveStateArr[1];

      var toastArr = React.useState('');
      var toast = toastArr[0], setToast = toastArr[1];

      var selArr = React.useState([]);
      var selected = selArr[0], setSelected = selArr[1];

      var selInitArr = React.useState([]);
      var selInit = selInitArr[0], setSelInit = selInitArr[1];

      var searchArr = React.useState('');
      var search = searchArr[0], setSearch = searchArr[1];

      var applyStateArr = React.useState('');
      var applyState = applyStateArr[0], setApplyState = applyStateArr[1];

      function refresh() {
        setLoading(true);
        apiGet('/status').then(function (data) {
          setSnap(data);
          setError('');
          if (data.settings) {
            setSaved(data.settings);
            setCool(String(data.settings.cooldownHours));
            setPort(String(data.settings.port));
          }
          if (Array.isArray(data.models)) {
            setSelected(data.models);
            setSelInit(data.models.slice());
          }
        }).catch(function (e) {
          setError(e.message || String(e));
        }).then(function () { setLoading(false); });
      }

      React.useEffect(function () {
        refresh();
        var t = setInterval(refresh, 15000);
        return function () { clearInterval(t); };
      }, []);

      function showToast(msg) {
        setToast(msg);
        setTimeout(function () { setToast(''); }, 2000);
      }

      function handleAdd() {
        var text = String(input || '').trim();
        if (text === '') { showToast('请先粘贴 key'); return; }
        apiPost('/keys', { keys: text }).then(function (res) {
          var msg = '已添加 ' + res.added + ' 个';
          if (res.skipped && res.skipped.length > 0) msg += '，跳过 ' + res.skipped.length + ' 个';
          showToast(msg);
          setInput('');
          refresh();
        }).catch(function (e) { showToast('添加失败：' + e.message); });
      }

      function handleRemove(masked) {
        apiPost('/keys/remove', { key: masked }).then(function () {
          showToast('已删除');
          refresh();
        }).catch(function (e) { showToast('删除失败：' + e.message); });
      }

      function handleRevive(masked) {
        apiPost('/keys/revive', { key: masked }).then(function (res) {
          showToast(res.revived ? '已恢复，可立即使用' : '该 key 不在冷却中');
          refresh();
        }).catch(function (e) { showToast('恢复失败：' + e.message); });
      }

      function handleCopy(masked) {
        apiPost('/reveal', { masked: masked }).then(function (res) {
          var text = res && res.key ? res.key : masked;
          var done = function () {
            var n = Object.assign({}, copied); n[masked] = true; setCopied(n);
            setTimeout(function () {
              var c = Object.assign({}, copied); delete c[masked]; setCopied(c);
            }, 1200);
          };
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done).catch(done);
          } else { done(); }
        }).catch(function (e) { showToast('复制失败：' + e.message); });
      }

      function toggleReveal(masked) {
        var n = Object.assign({}, revealed);
        if (n[masked]) { delete n[masked]; setRevealed(n); return; }
        apiPost('/reveal', { masked: masked }).then(function (res) {
          var w = Object.assign({}, n); w[masked] = res.key; setRevealed(w);
        }).catch(function (e) { showToast('读取失败：' + e.message); });
      }

      function isDirty() {
        return Number(cool) !== saved.cooldownHours || Number(port) !== saved.port;
      }
      function handleSave() {
        if (!isDirty()) { setSaveState('没有改动'); setTimeout(function () { setSaveState(''); }, 1500); return; }
        var c = Number(cool), p = Number(port);
        var errs = [];
        if (!Number.isInteger(c) || c < 1 || c > 720) errs.push('冷却需在 1-720 小时');
        if (!Number.isInteger(p) || p < 1024 || p > 65535) errs.push('端口需在 1024-65535');
        if (errs.length > 0) { setSaveState(errs.join('；')); return; }
        apiPost('/settings', { cooldownHours: c, port: p }).then(function (res) {
          setSaved(res.settings);
          setSaveState('已保存（端口改动需重启 DSH）');
          setTimeout(function () { setSaveState(''); }, 2500);
          refresh();
        }).catch(function (e) { setSaveState('保存失败：' + e.message); });
      }

      function toggleModel(id) {
        var idx = selected.indexOf(id);
        var next = selected.slice();
        if (idx >= 0) next.splice(idx, 1); else next.push(id);
        setSelected(next);
        setApplyState('');
      }

      function modelsDirty() {
        return selected.slice().sort().join('|') !== selInit.slice().sort().join('|');
      }

      function handleApply() {
        if (!modelsDirty()) return;
        apiPost('/models', { models: selected }).then(function (res) {
          setSelInit(res.models.slice());
          setSelected(res.models.slice());
          if (res.error) {
            setApplyState('写入失败：' + res.error);
          } else if (res.hotReloaded) {
            setApplyState('已生效');
          } else if (res.profileUpdated) {
            setApplyState('已写入，但热重载未成功，需重启 DSH');
          } else {
            setApplyState('没有变化');
          }
          setTimeout(function () { setApplyState(''); }, 4000);
          refresh();
        }).catch(function (e) { setApplyState('应用失败：' + e.message); });
      }

      var counts = (snap && snap.counts) || { total: 0, usable: 0, cooling: 0, exhausted: 0 };
      var keys = (snap && snap.keys) || [];
      var catalog = (snap && snap.catalog) || [];
      var credit = (snap && snap.credit) || null;
      var dotClass = counts.total === 0 ? 'bad' : counts.usable === 0 ? 'warn' : '';
      var statusText = counts.total === 0 ? '未配置 key'
        : counts.usable === 0 ? '所有 key 不可用' : '代理运行中';

      // 状态栏副标题：模型页显示选中数，Key 页显示剩余额度
      var subtitle;
      if (tab === 'models') {
        subtitle = '已选 ' + selected.length + ' / ' + catalog.length + ' 个模型';
      }
      else if (credit && credit.ok) {
        subtitle = '今日剩余 ' + formatPts(credit.remainingPts) + ' pts';
      }
      else {
        subtitle = counts.cooling + ' 个冷却中';
      }

      var children = [];

      // 内部分页
      children.push(React.createElement('div', { className: 'ak-subtabs', key: 'st' },
        React.createElement('div', {
          className: 'ak-subtab' + (tab === 'keys' ? ' active' : ''),
          onClick: function () { setTab('keys'); },
        }, 'Key 管理'),
        React.createElement('div', {
          className: 'ak-subtab' + (tab === 'models' ? ' active' : ''),
          onClick: function () { setTab('models'); },
        }, '模型选择')));

      // 状态栏
      children.push(React.createElement('div', { className: 'ak-statusbar', key: 'sb' },
        React.createElement('div', { className: 'ak-status-left' },
          React.createElement('div', { className: 'ak-dot ' + dotClass }),
          React.createElement('div', null,
            React.createElement('div', { className: 'ak-status-text' }, 'AMD Radeon Cloud'),
            React.createElement('div', { className: 'ak-status-sub' },
              '127.0.0.1:' + ((snap && snap.port) || port) + ' · ' + counts.total + ' 个 key · ' + subtitle))),
        React.createElement('div', { className: 'ak-status-right' },
          React.createElement('button', { className: 'ak-btn', onClick: refresh, disabled: loading },
            REFRESH_ICON, ' 刷新'))));

      if (tab === 'keys') {
        // ── 额度卡片（真实 /usage 数据）──
        if (credit && credit.ok) {
          var ratio = credit.usedRatio || 0;
          var barCls = ratio >= 0.9 ? ' bad' : ratio >= 0.6 ? ' warn' : '';
          children.push(React.createElement('div', { className: 'ak-creditgrid', key: 'cg' },
            creditCard('今日已用', formatPts(credit.usedPts), 'pts', '$' + formatPts(credit.usedPts) + ' USD', ''),
            creditCard('今日剩余', formatPts(credit.remainingPts), 'pts', '$' + formatPts(credit.remainingPts) + ' USD', 'ok'),
            creditCard('今日 Token', formatTokens(credit.todayTokens || 0), '', (credit.todayRequests || 0) + ' 次请求 · ' + (credit.todayErrors || 0) + ' 次错误', ''),
            creditCard('RPM 上限', String(credit.rpmLimit || 0), '/min', '超出后暂停 60 秒', '')));
          children.push(React.createElement('div', { className: 'ak-barwrap', key: 'bw' },
            React.createElement('div', { className: 'ak-bar' },
              React.createElement('div', { className: 'ak-barfill' + barCls, style: { width: Math.min(100, ratio * 100) + '%' } })),
            React.createElement('div', { className: 'ak-barmeta' },
              React.createElement('span', null, '日额度 ' + formatPts(credit.limitPts) + ' pts · 已用 ' + (ratio * 100).toFixed(2) + '%'),
              React.createElement('span', null, '重置：' + formatResetIn(credit.resetEpoch)))));
        }
        else {
          children.push(React.createElement('div', { className: 'ak-stats', key: 'stats' },
            stat('可用', counts.usable, 'ok'),
            stat('冷却中', counts.cooling, 'warn'),
            stat('已耗尽', counts.exhausted, 'bad'),
            stat('Key 总数', counts.total, '')));
        }

        if (keys.length === 0) {
          children.push(React.createElement('div', { className: 'ak-empty', key: 'empty' },
            '还没有添加 key。', React.createElement('br'),
            '在下方粘贴你的 AMD Radeon Cloud key，每行一个。'));
        }
        else {
          children.push(React.createElement('div', { className: 'ak-keylist', key: 'kl' },
            keys.map(function (k, idx) {
              var kc = k.credit;
              var r = ringOf(kc ? kc.ratio : 0);
              var rowClass = 'ak-keyrow' + (k.exhausted ? ' exhausted' : k.cooling ? ' cooling' : '');
              var badge = k.exhausted ? ['exhausted', '已耗尽'] : k.cooling ? ['cooling', '冷却中'] : ['ok', '正常'];
              var fullKey = revealed[k.masked];
              var isRev = typeof fullKey === 'string' && fullKey !== '';
              return React.createElement('div', { className: rowClass, key: k.masked },
                React.createElement('div', { className: 'ak-keymain' },
                  React.createElement('div', { className: 'ak-keyline' },
                    React.createElement('span', { className: 'ak-keyidx' }, String(idx + 1)),
                    React.createElement('span', { className: 'ak-keyname' + (isRev ? '' : ' masked') },
                      isRev ? fullKey : k.masked),
                    React.createElement('div', { className: 'ak-iconbar' },
                      React.createElement('button', {
                        className: 'ak-iconbtn', title: isRev ? '隐藏' : '显示',
                        onClick: function () { toggleReveal(k.masked); },
                      }, isRev ? EYE_OFF : EYE_OPEN),
                      React.createElement('button', {
                        className: 'ak-iconbtn' + (copied[k.masked] ? ' copied' : ''), title: '复制',
                        onClick: function () { handleCopy(k.masked); },
                      }, copied[k.masked] ? CHECK_ICON : COPY_ICON))),
                  React.createElement('div', { className: 'ak-keymeta' },
                    k.exhausted
                      ? '额度耗尽 · ' + (kc && kc.resetEpoch ? formatResetIn(kc.resetEpoch) + ' 重置' : '等待恢复')
                      : k.cooling
                        ? formatRemain(k.cooldownUntil)
                        : (kc && kc.requests
                          ? '今日 ' + kc.requests + ' 次请求 · ' + formatLastUsed(k.lastUsedAt)
                          : formatLastUsed(k.lastUsedAt)))),
                React.createElement('span', { className: 'ak-badge ' + badge[0] }, badge[1]),
                React.createElement('div', { className: 'ak-usage' },
                  React.createElement('div', { className: 'ak-ring' },
                    React.createElement('svg', { width: 34, height: 34 },
                      React.createElement('circle', { className: 'ak-ring-bg', cx: 17, cy: 17, r: 14 }),
                      React.createElement('circle', {
                        className: 'ak-ring-fg ' + r.color, cx: 17, cy: 17, r: 14,
                        strokeDasharray: r.C, strokeDashoffset: r.offset,
                      })),
                    React.createElement('div', { className: 'ak-ring-txt' }, r.pct + '%')),
                  React.createElement('span', { className: 'ak-usage-num' },
                    kc ? React.createElement('span', null,
                      React.createElement('span', { style: { color: '#e6edf3' } }, formatPts(kc.usedPts)), ' pts')
                      : '—')),
                React.createElement('div', { className: 'ak-actions' },
                  (k.cooling || k.exhausted) ? React.createElement('button', {
                    className: 'ak-iconbtn', title: '误判恢复：立即清除冷却状态',
                    onClick: function () { handleRevive(k.masked); },
                  }, REVIVE_ICON) : null,
                  React.createElement('button', {
                    className: 'ak-del', title: '删除',
                    onClick: function () { handleRemove(k.masked); },
                  }, '×')));
            })));
        }

        children.push(React.createElement('div', { className: 'ak-addarea', key: 'add' },
          React.createElement('textarea', {
            className: 'ak-textarea',
            placeholder: '粘贴一个或多个 key，每行一个：\nrc-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            value: input,
            onChange: function (e) { setInput(e.target.value); },
          }),
          React.createElement('div', { className: 'ak-addfooter' },
            React.createElement('span', { className: 'ak-addhint' },
              toast || '支持批量粘贴 · 重复的 key 会自动跳过'),
            React.createElement('button', { className: 'ak-btn primary', onClick: handleAdd }, '添加'))));

        children.push(React.createElement('div', { className: 'ak-settings', key: 'cfg' },
          React.createElement('div', { className: 'ak-field' },
            React.createElement('span', null, '冷却时长'),
            React.createElement('input', {
              type: 'number', value: cool, min: 1, max: 720,
              onChange: function (e) { setCool(e.target.value); },
            }),
            React.createElement('span', null, '小时')),
          React.createElement('div', { className: 'ak-field' },
            React.createElement('span', null, '代理端口'),
            React.createElement('input', {
              type: 'number', value: port, min: 1024, max: 65535,
              onChange: function (e) { setPort(e.target.value); },
            })),
          React.createElement('div', { className: 'ak-field' },
            React.createElement('span', null, '全部耗尽时'),
            React.createElement('span', { style: { color: '#f85149' } }, '直接报错')),
          React.createElement('span', { className: 'ak-savestate' }, saveState),
          React.createElement('button', {
            className: 'ak-savebtn' + (isDirty() ? ' dirty' : ''),
            onClick: handleSave,
          }, isDirty() ? '保存修改' : '保存')));
      }
      else {
        // 模型选择页
        var q = search.trim().toLowerCase();
        var visible = catalog.filter(function (m) {
          return q === '' || m.id.toLowerCase().indexOf(q) >= 0;
        });

        children.push(React.createElement('div', { className: 'ak-toolbar', key: 'tb' },
          React.createElement('div', { className: 'ak-toolbar-left' },
            React.createElement('span', null, '已选 '),
            React.createElement('span', { className: 'ak-count' }, String(selected.length)),
            React.createElement('span', null, ' 个模型')),
          React.createElement('div', { className: 'ak-toolbar-right' },
            React.createElement('input', {
              className: 'ak-search', placeholder: '搜索模型…', value: search,
              onChange: function (e) { setSearch(e.target.value); },
            }),
            React.createElement('button', {
              className: 'ak-btn small',
              onClick: function () {
                var next = selected.slice();
                visible.forEach(function (m) {
                  if (next.indexOf(m.id) < 0 && m.conversational) next.push(m.id);
                });
                setSelected(next); setApplyState('');
              },
            }, '全选'),
            React.createElement('button', {
              className: 'ak-btn small',
              onClick: function () {
                var ids = visible.map(function (m) { return m.id; });
                setSelected(selected.filter(function (id) { return ids.indexOf(id) < 0; }));
                setApplyState('');
              },
            }, '清空'))));

        children.push(React.createElement('div', { className: 'ak-modellist', key: 'ml' },
          visible.map(function (m) {
            var on = selected.indexOf(m.id) >= 0;
            var cls = 'ak-modelrow' + (on ? ' selected' : '') + (m.conversational ? '' : ' disabled');
            return React.createElement('div', {
              className: cls, key: m.id,
              onClick: function () { if (m.conversational) toggleModel(m.id); },
            },
              React.createElement('div', { className: 'ak-cb' }, CHECK_ICON),
              React.createElement('div', { className: 'ak-modelmain' },
                React.createElement('div', { className: 'ak-modelname' }, m.name),
                React.createElement('div', { className: 'ak-modelmeta' },
                  m.input && m.input.indexOf('image') >= 0
                    ? React.createElement('span', { className: 'ak-tag vision' }, '图片') : null,
                  m.effortCount > 0
                    ? React.createElement('span', { className: 'ak-tag reason' }, '思考 ' + m.effortCount + ' 档') : null,
                  m.note ? React.createElement('span', { className: 'ak-tag warn' }, m.note) : null)),
              React.createElement('div', { className: 'ak-ctx' }, formatCtx(m.contextWindow)),
              React.createElement('div', { className: 'ak-efforts' },
                m.conversational ? (m.effortCount > 0 ? m.effortCount + ' 档可选' : '无档位') : '非对话'));
          })));

        children.push(React.createElement('div', { className: 'ak-savebar', key: 'sb2' },
          React.createElement('span', { className: 'ak-savehint' },
            '勾选后点「应用」'),
          React.createElement('span', { className: 'ak-spacer' }),
          React.createElement('span', { className: 'ak-savestate' }, applyState),
          React.createElement('button', {
            className: 'ak-applybtn' + (modelsDirty() ? ' dirty' : ''),
            onClick: handleApply,
          }, modelsDirty() ? '应用' : '已应用')));
      }

      if (error) {
        children.push(React.createElement('div', {
          key: 'err',
          style: { color: '#f85149', fontSize: '11px', padding: '6px 10px', background: 'rgba(248,81,73,.08)', borderRadius: '4px' },
        }, '无法连接插件服务：' + error));
      }

      return React.createElement('div', { className: 'ak-wrap' + (tab === 'models' ? ' ak-wrap-models' : '') }, children);
    }

    function creditCard(label, value, unit, note, tone) {
      return React.createElement('div', { className: 'ak-creditcard', key: label },
        React.createElement('span', { className: 'ak-clabel' }, label),
        React.createElement('span', { className: 'ak-cvalue' + (tone ? ' ' + tone : '') },
          String(value), unit ? React.createElement('span', { className: 'ak-cunit' }, unit) : null),
        React.createElement('span', { className: 'ak-cnote' }, note));
    }
    function stat(label, value, tone) {
      return React.createElement('div', { className: 'ak-stat', key: label },
        React.createElement('span', { className: 'ak-stat-label' }, label),
        React.createElement('span', { className: 'ak-stat-value ' + (tone || '') }, String(value)));
    }

    /**
     * 注入样式。
     *
     * 每次都覆盖，而不是「已存在就跳过」：插件热重载时页面不会刷新，
     * 旧的 <style> 还留在 head 里，跳过就意味着新 CSS 永远不生效——
     * 改了样式看不到变化，看起来像没加载。
     */
    function injectStyles(css) {
      var id = 'dsh-amdkey-style';
      var el = document.getElementById(id);
      if (el === null) {
        el = document.createElement('style');
        el.id = id;
        document.head.appendChild(el);
      }
      if (el.textContent !== css) el.textContent = css;
    }

    /**
     * 对齐聊天框：量出本面板与聊天输入框之间的左右差，写进 --amdkey-gutter。
     *
     * 之前按 textarea 找输入框，结果量到了面板自己的粘贴框。这里改成：
     * 先拿到自己的根节点，再看它和「真正的输入框」各自距视口多远，取差值。
     * 找不到输入框就保持 CSS 里的默认值。
     */
    function syncGutter() {
      try {
        var self = document.querySelector('.ak-wrap');
        if (self === null) return;

        // 排除面板内部的 textarea，只在面板之外找
        var all = document.querySelectorAll('textarea');
        var target = null;
        for (var i = 0; i < all.length; i++) {
          var node = all[i];
          if (self.contains(node)) continue;
          var r = node.getBoundingClientRect();
          if (r.width > 200 && r.height > 0) { target = r; break; }
        }
        if (target === null) return;

        var mine = self.getBoundingClientRect();
        // 输入框比面板窄多少，就把这个差值平均分到左右
        var inset = Math.round((mine.width - target.width) / 2);
        if (inset > 0 && inset < 300) {
          document.documentElement.style.setProperty('--amdkey-gutter', inset + 'px');
        }
      }
      catch { /* 量不到就用默认值 */ }
    }

    function apply(ctx) {
      var slots = ctx.get('slots');
      if (slots === undefined) return;
      ctx.effect(function () {
        injectStyles(CSS);
        syncGutter();
        var timer = setInterval(syncGutter, 1500);
        window.addEventListener('resize', syncGutter);
        return function () {
          clearInterval(timer);
          window.removeEventListener('resize', syncGutter);
        };
      });
      slots.inject('conversation.view', function () {
        return slots.register(
          { name: 'conversation.view', id: 'dsh-amdkey', label: 'AMDkey', order: 20 },
          function () { return React.createElement(Panel); });
      });
    }

    exports.name = 'dsh-amdkey';
    exports.inject = ['slots'];
    exports.apply = apply;
    return exports;
  },
});
