/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export interface AngularDetection {
  // This is necessary because the runtime
  // message listener handles messages globally
  // including from other extensions. We don't
  // want to set icon and/or popup based on
  // a message coming from an unrelated extension.
  isAngularDevTools: true;
  isIvy: boolean;
  isAngular: boolean;
  isDebugMode: boolean;
  isSupportedAngularVersion: boolean;
}

window.addEventListener('message', (event: MessageEvent) => {
  if (event.source === window && event.data) {
    chrome.runtime.sendMessage(event.data);
  }
});

function detectAngular(win: Window): void {
  const isDebugMode = Boolean((win as any).ng);
  const ngVersionElement = document.querySelector('[ng-version]');
  let isSupportedAngularVersion = false;
  let isAngular = false;
  if (ngVersionElement) {
    isAngular = true;
    const attr = ngVersionElement.getAttribute('ng-version');
    const major = attr ? parseInt(attr.split('.')[0], 10) : -1;
    // In case of g3 apps we support major 0.
    if (attr && (major >= 9 || major === 0)) {
      isSupportedAngularVersion = true;
    }
  }

  win.postMessage(
      {
        // Needs to be inline because we're stringifying
        // this function and executing it with eval.
        isIvy: typeof (window as any).getAllAngularRootElements?.()?.[0]?.__ngContext__ !==
            'undefined',
        isAngular,
        isDebugMode,
        isSupportedAngularVersion,
        isAngularDevTools: true,
      } as AngularDetection,
      '*');

  if (!isAngular) {
    setTimeout(() => detectAngular(win), 1000);
  }
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
