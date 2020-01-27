let reloadFns: ((url: string) => void)[] = [];
export const panelDevTools = {
  injectBackend(cb?: () => void) {
    injectScripts(['backend.js'], cb);
  },

  onReload(reloadFn: (url: string) => void) {
    reloadFns.push(reloadFn);
    chrome.devtools.network.onNavigated.addListener(reloadFn);
  },

  destroy() {
    reloadFns.forEach(f => chrome.devtools.network.onNavigated.removeListener(f));
    reloadFns = [];
  }
};

const injectScripts = (scripts: string[], cb?: () => void) => {
  let injected = 0;
  scripts.forEach(s => injectScript(chrome.runtime.getURL(s), () => {
    injected++;
    if (injected === scripts.length && cb) {
      cb();
    }
  }));
};

const injectScript = (scriptName: string, cb: () => void) => {
  const src = `
    (function() {
      var script = document.constructor.prototype.createElement.call(document, 'script');
      script.src = "${scriptName}";
      document.documentElement.appendChild(script);
      script.parentNode.removeChild(script);
    })()
  `;
  chrome.devtools.inspectedWindow.eval(src, (_, err) => {
    if (err) {
      console.log(err);
    }
    cb();
  });
};
