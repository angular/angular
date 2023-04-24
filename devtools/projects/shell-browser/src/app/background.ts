/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="chrome"/>

import {AngularDetection} from './detect-angular-for-extension-icon';

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
    () => {});

const ports: {
  [tab: string]:
      |{
        'content-script': chrome.runtime.Port|null;
        devtools: chrome.runtime.Port|null;
      }|undefined;
} = {};

chrome.runtime.onConnect.addListener((port) => {
  let tab: string|null = null;
  let name: string|null = null;
  // tslint:disable-next-line:no-console
  console.log('Connection event in the background script');

  if (isNumeric(port.name)) {
    tab = port.name;

    // tslint:disable-next-line:no-console
    console.log('Angular devtools connected, injecting the content script', port.name, ports[tab]);

    name = 'devtools';
    installContentScript(parseInt(port.name, 10));
  } else {
    if (!port.sender || !port.sender.tab) {
      // tslint:disable-next-line:no-console
      console.error('Unable to access the port sender and sender tab');

      return;
    }
    if (port.sender.tab.id === undefined) {
      // tslint:disable-next-line:no-console
      console.error('Sender tab id is undefined');

      return;
    }

    // tslint:disable-next-line:no-console
    console.log('Content script connected', port.sender.tab.id);
    tab = port.sender.tab.id.toString();
    name = 'content-script';
  }

  let portsTab = ports[tab];
  if (!portsTab) {
    // tslint:disable-next-line:no-console
    console.log('Creating a tab port');

    portsTab = ports[tab] = {
      devtools: null,
      'content-script': null,
    };
  }

  portsTab[name] = port;

  if (portsTab.devtools && portsTab['content-script']) {
    doublePipe(portsTab.devtools, portsTab['content-script'], tab);
  }
});

const isNumeric = (str: string): boolean => {
  return +str + '' === str;
};

const installContentScript = (tabId: number) => {
  // tslint:disable-next-line:no-console
  console.log('Installing the content-script');

  // We first inject the content-script and after that
  // invoke the global that it exposes.

  if (isManifestV3) {
    chrome.scripting.executeScript(
        {files: ['app/content_script_bundle.js'], target: {tabId}}, () => {
          chrome.scripting.executeScript({func: () => globalThis.main(), target: {tabId}});
        });

    return;
  }

  // manifest V2 APIs
  chrome.tabs.executeScript(tabId, {file: 'app/content_script_bundle.js'}, (result) => {
    chrome.tabs.executeScript(tabId, {
      code: 'globalThis.main()',
    });
  });
};

const doublePipe =
    (devtoolsPort: chrome.runtime.Port|null, contentScriptPort: chrome.runtime.Port,
     tab: string) => {
      if (devtoolsPort === null) {
        console.warn('DevTools port is equal to null');
        return;
      }

      // tslint:disable-next-line:no-console
      console.log('Creating two-way communication channel', Date.now(), ports);

      const onDevToolsMessage = (message: chrome.runtime.Port) => {
        contentScriptPort.postMessage(message);
      };
      devtoolsPort.onMessage.addListener(onDevToolsMessage);

      const onContentScriptMessage = (message: chrome.runtime.Port) => {
        devtoolsPort.postMessage(message);
      };
      contentScriptPort.onMessage.addListener(onContentScriptMessage);

      const shutdown = (source: string) => {
        // tslint:disable-next-line:no-console
        console.log('Disconnecting', source);

        devtoolsPort.onMessage.removeListener(onDevToolsMessage);
        contentScriptPort.onMessage.removeListener(onContentScriptMessage);
        devtoolsPort.disconnect();
        contentScriptPort.disconnect();
        ports[tab] = undefined;
      };
      devtoolsPort.onDisconnect.addListener(shutdown.bind(null, 'devtools'));
      contentScriptPort.onDisconnect.addListener(shutdown.bind(null, 'content-script'));
    };

const getPopUpName = (ng: AngularDetection) => {
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
};

chrome.runtime.onMessage.addListener((req, sender) => {
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
        () => {});
  }
});
