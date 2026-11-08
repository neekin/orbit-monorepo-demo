/* Orbit Chat SDK — zero dependency, usable on any HTML page. */
(function () {
  'use strict';
  /* <design-tokens> */
  var orbitTheme = {
    brand: '#176b83',
    brandHover: '#12566c',
    brandSoft: '#edf6f8',
    navigation: '#0b1b2e',
    navigationText: '#bdccdc',
    navigationActive: '#173b50',
    page: '#f5f7fa',
    surface: '#ffffff',
    surfaceSubtle: '#f8fafc',
    text: '#24354a',
    textSecondary: '#53677d',
    textMuted: '#64778b',
    border: '#dfe6ee',
    success: '#287e72',
    successSoft: '#eef7f3',
    warning: '#946512',
    warningSoft: '#fff6e5',
    danger: '#b0444b',
    dangerSoft: '#fff0f0',
    focus: '#8cbdcd',
    overlay: '#0b1b2e66',
  };
  /* </design-tokens> */
  var script = document.currentScript;
  var previous = window.OrbitChat;
  if (previous && previous.destroy) previous.destroy();
  var root, shadow, frame, panel, launcher, listener, options;
  function close() {
    if (!panel) return;
    panel.hidden = true;
    launcher.setAttribute('aria-expanded', 'false');
    launcher.focus();
  }
  function open() {
    if (!panel) return;
    if (!frame) {
      var url = new URL(options.url, window.location.href);
      url.searchParams.set('embed', '1');
      url.searchParams.set('parentOrigin', window.location.origin);
      url.searchParams.set('mode', options.mode);
      if (options.apiBaseUrl) url.searchParams.set('api', options.apiBaseUrl);
      frame = document.createElement('iframe');
      frame.title = 'Orbit 客服聊天窗口';
      frame.src = url.href;
      frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms');
      panel.appendChild(frame);
      listener = function (event) {
        if (event.source !== frame.contentWindow || event.origin !== url.origin) return;
        if (
          event.data &&
          typeof event.data === 'object' &&
          !Array.isArray(event.data) &&
          Object.keys(event.data).length === 1 &&
          event.data.type === 'orbit-chat:close'
        )
          close();
      };
      window.addEventListener('message', listener);
    }
    panel.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    frame.focus();
  }
  function destroy() {
    document.removeEventListener('DOMContentLoaded', autoInit);
    if (listener) window.removeEventListener('message', listener);
    if (root) root.remove();
    root = shadow = frame = panel = launcher = listener = null;
  }
  function init(config) {
    destroy();
    options = Object.assign(
      { url: new URL('./', script ? script.src : location.href).href, mode: 'mock' },
      config || {},
    );
    var url = new URL(options.url, location.href);
    if (url.protocol !== 'http:' && url.protocol !== 'https:')
      throw new Error('Widget URL must use HTTP(S)');
    root = document.createElement('div');
    root.id = 'orbit-chat-widget';
    root.style.cssText = 'position:fixed;inset:auto 24px 24px auto;z-index:2147483000;';
    shadow = root.attachShadow({ mode: 'open' });
    var style = document.createElement('style');
    style.textContent = `:host{all:initial}*{box-sizing:border-box}.launcher{height:52px;border:1px solid ${orbitTheme.brand};border-radius:28px;padding:0 21px;background:${orbitTheme.brand};color:${orbitTheme.surface};font:600 13px system-ui,sans-serif;cursor:pointer;box-shadow:0 7px 24px ${orbitTheme.overlay};display:flex;align-items:center;gap:10px}.launcher:focus-visible{outline:3px solid ${orbitTheme.focus};outline-offset:3px}.panel{position:absolute;bottom:66px;right:0;width:min(380px,calc(100vw - 32px));height:min(570px,calc(100dvh - 116px));border-radius:14px;overflow:hidden;background:${orbitTheme.surface};box-shadow:0 16px 60px ${orbitTheme.overlay};border:1px solid ${orbitTheme.border}}.panel[hidden]{display:none}iframe{display:block;border:0;width:100%;height:100%}@media(max-width:480px){.panel{right:-8px}}`;
    panel = document.createElement('section');
    panel.className = 'panel';
    panel.id = 'orbit-chat-panel';
    panel.hidden = true;
    panel.setAttribute('aria-label', '客服聊天');
    launcher = document.createElement('button');
    launcher.className = 'launcher';
    launcher.type = 'button';
    launcher.textContent = '◌  联系客服';
    launcher.setAttribute('aria-expanded', 'false');
    launcher.setAttribute('aria-controls', 'orbit-chat-panel');
    launcher.addEventListener('click', function () {
      if (panel.hidden) open();
      else close();
    });
    shadow.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') close();
    });
    shadow.append(style, panel, launcher);
    document.body.appendChild(root);
  }
  window.OrbitChat = { init: init, open: open, close: close, destroy: destroy };
  function autoInit() {
    init({
      url:
        (script && script.dataset.widgetUrl) ||
        new URL('./', script ? script.src : location.href).href,
      mode: (script && script.dataset.mode) || 'mock',
      apiBaseUrl: (script && script.dataset.apiBaseUrl) || undefined,
    });
  }
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', autoInit, { once: true });
  else autoInit();
})();
