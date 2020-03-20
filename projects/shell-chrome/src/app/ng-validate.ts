window.addEventListener('message', (event: MessageEvent) => {
  if (event.source === window && event.data) {
    chrome.runtime.sendMessage(event.data);
  }
});

function detectAngular(win: Window): void {
  const isDebugMode = Boolean((win as any).ng);
  const ngVersionElement = document.querySelector('[ng-version]');
  let isSupportedAngularVersion = false;
  if (ngVersionElement) {
    const attr = ngVersionElement.getAttribute('ng-version');
    if (attr && parseInt(attr.split('.')[0], 10) >= 0) {
      isSupportedAngularVersion = true;
    }
  }

  win.postMessage(
    {
      isDebugMode,
      isSupportedAngularVersion,
    },
    '*'
  );
}

function installScript(fn: string): void {
  const source = `;(${fn})(window)`;
  const script = document.createElement('script');
  script.textContent = source;
  document.documentElement.appendChild(script);
  const parentElement = script.parentElement;
  if (parentElement) {
    parentElement.removeChild(script);
  }
}

if (document instanceof HTMLDocument) {
  installScript(detectAngular.toString());
}
