/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  appIsAngular,
  appIsAngularInDevMode,
  appIsAngularIvy,
  appIsSupportedAngularVersion,
} from 'shared-utils';

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
  const isAngular = appIsAngular();
  const isSupportedAngularVersion = appIsSupportedAngularVersion();
  const isDebugMode = appIsAngularInDevMode();
  const isIvy = appIsAngularIvy();

  win.postMessage(
    {
      isIvy,
      isAngular,
      isDebugMode,
      isSupportedAngularVersion,
      isAngularDevTools: true,
    } as AngularDetection,
    '*',
  );

  if (!isAngular) {
    setTimeout(() => detectAngular(win), 1000);
  }
}

detectAngular(window);
