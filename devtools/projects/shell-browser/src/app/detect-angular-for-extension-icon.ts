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
    if (attr && (major >= 12 || major === 0)) {
      isSupportedAngularVersion = true;
    }
  }

  win.postMessage(
      {
        isIvy: typeof (ngVersionElement as any)?.__ngContext__ !== 'undefined',
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

detectAngular(window);
