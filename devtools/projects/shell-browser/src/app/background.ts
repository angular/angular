/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/// <reference types="chrome"/>

import {AngularDetection} from '../../../protocol';
import {TabManager} from './tab_manager';

function getPopUpName(ng: AngularDetection): string {
  if (!ng.isAngular) {
    return 'not-angular.html';
  }
  if (!ng.isIvy || !ng.isSupportedAngularVersion) {
    return 'unsupported.html';
  }
  if (!ng.isDebugMode) {
    return 'production.html';
  }
  return 'supported.html';
}

/**
 * Probes an internal Google-only domain (g3doc.corp.google.com) using `mode: 'no-cors'`.
 * Connectivity success vs. network/transport error is used as a heuristic to detect
 * if the user is connected to the internal Google corp network/VPN.
 */
function checkGoogler(): void {
  fetch('https://g3doc.corp.google.com/does/not/exist/for/angular/devtools', {
    mode: 'no-cors',
    method: 'HEAD',
  })
    .then(() => chrome.storage.local.set({isGoogler: true}))
    .catch(() => chrome.storage.local.set({isGoogler: false}));
}

if (chrome !== undefined && chrome.runtime !== undefined) {
  // Check Googler status on background service worker startup/wake-up.
  checkGoogler();

  const isManifestV3 = chrome.runtime.getManifest().manifest_version === 3;

  const browserAction = (() => {
    // Electron does not expose browserAction object,
    // Use empty calls as fallback if they are not defined.
    const noopAction = {setIcon: () => {}, setPopup: () => {}};

    if (isManifestV3) {
      return chrome.action || noopAction;
    }

    return chrome.browserAction || noopAction;
  })();

  // By default use the black and white icon.
  // Replace it only when we detect an Angular app.
  browserAction.setIcon(
    {
      path: {
        16: chrome.runtime.getURL(`assets/icon-bw16.png`),
        48: chrome.runtime.getURL(`assets/icon-bw48.png`),
        128: chrome.runtime.getURL(`assets/icon-bw128.png`),
      },
    },
    () => {},
  );

  chrome.runtime.onMessage.addListener((req: AngularDetection, sender) => {
    if (!req.isAngularDevTools) {
      return;
    }

    if (sender && sender.tab) {
      browserAction.setPopup({
        tabId: sender.tab.id,
        popup: `popups/${getPopUpName(req)}`,
      });
    }

    if (sender && sender.tab && req.isAngular) {
      browserAction.setIcon(
        {
          tabId: sender.tab.id,
          path: {
            16: chrome.runtime.getURL(`assets/icon16.png`),
            48: chrome.runtime.getURL(`assets/icon48.png`),
            128: chrome.runtime.getURL(`assets/icon128.png`),
          },
        },
        () => {},
      );
    }
  });

  const tabs = {};
  TabManager.initialize(tabs);
}
