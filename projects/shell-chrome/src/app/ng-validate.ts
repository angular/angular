window.addEventListener('message', (event: MessageEvent) => {
  if (event.source === window && event.data) {
    chrome.runtime.sendMessage(event.data);
  }
});

function detectAngular(win: Window): void {
  const isDebugMode = Boolean((win as any).ng);
  const ngVersionElement = document.querySelector('[ng-version]');
  const isSupportedAngularVersion = ngVersionElement
    ? +ngVersionElement.getAttribute('ng-version').split('.')[0] >= 9
    : false;

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
  script.parentNode.removeChild(script);
}

if (document instanceof HTMLDocument) {
  installScript(detectAngular.toString());
}
