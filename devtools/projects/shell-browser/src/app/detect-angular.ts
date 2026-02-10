/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AngularDetection} from '../../../protocol';
import {
  appIsAngular,
  appIsAngularInDevMode,
  appIsAngularIvy,
  appIsSupportedAngularVersion,
} from '../../../shared-utils';
import {CONTENT_SCRIPT_URI, DETECT_ANGULAR_SCRIPT_URI} from './communication';

import {SamePageMessageBus} from './same-page-message-bus';

const detectAngularMessageBus = new SamePageMessageBus(
  DETECT_ANGULAR_SCRIPT_URI,
  CONTENT_SCRIPT_URI,
);

let detectAngularTimeout: ReturnType<typeof setTimeout>;

function detectAngular(win: Window): void {
  const isAngular = appIsAngular();
  const isSupportedAngularVersion = appIsSupportedAngularVersion();
  const isDebugMode = appIsAngularInDevMode();
  const isIvy = appIsAngularIvy();

  const detection: AngularDetection = {
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

  detectAngularTimeout = setTimeout(() => detectAngular(win), 1000);
}

detectAngularMessageBus.on('backendInstalled', () => {
  clearTimeout(detectAngularTimeout);
});

detectAngular(window);
