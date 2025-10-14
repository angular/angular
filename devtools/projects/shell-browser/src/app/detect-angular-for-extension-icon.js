/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  appIsAngular,
  appIsAngularInDevMode,
  appIsAngularIvy,
  appIsSupportedAngularVersion,
} from '../../../shared-utils';
import {SamePageMessageBus} from './same-page-message-bus';
const detectAngularMessageBus = new SamePageMessageBus(
  `angular-devtools-detect-angular-${location.href}`,
  `angular-devtools-content-script-${location.href}`,
);
function detectAngular(win) {
  const isAngular = appIsAngular();
  const isSupportedAngularVersion = appIsSupportedAngularVersion();
  const isDebugMode = appIsAngularInDevMode();
  const isIvy = appIsAngularIvy();
  const detection = {
    isIvy,
    isAngular,
    isDebugMode,
    isSupportedAngularVersion,
    isAngularDevTools: true,
  };
  // For the background script to toggle the icon.
  win.postMessage(detection, '*');
  // For the content script to inject the backend.
  detectAngularMessageBus.emit('detectAngular', [
    {
      isIvy,
      isAngular,
      isDebugMode,
      isSupportedAngularVersion,
      isAngularDevTools: true,
    },
  ]);
  setTimeout(() => detectAngular(win), 1000);
}
detectAngular(window);
//# sourceMappingURL=detect-angular-for-extension-icon.js.map
