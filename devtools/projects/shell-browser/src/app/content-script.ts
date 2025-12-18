/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/// <reference types="chrome"/>

import {ChromeMessageBus} from './chrome-message-bus';
import {BACKEND_URI, CONTENT_SCRIPT_URI, DETECT_ANGULAR_SCRIPT_URI} from './communication';
import {SamePageMessageBus} from './same-page-message-bus';

let backgroundDisconnected = false;
let backendInitialized = false;

const port = chrome.runtime.connect({
  name: `${document.title || location.href}`,
});

// Since Manifest V3, the service worker (background)
// gets terminated after 30s of inactivity. This can
// break the initialization phase of DevTools or the
// BE-FE communication channel, if already initialized.
// To prevent that, we emit a heartbeat in a >30s interval.
const HEARTBEAT_INTERVAL = 20000; // Keep below 30s
const heartbeatInterval = setInterval(() => {
  port.postMessage('__NG_DEVTOOLS_BEAT');
}, HEARTBEAT_INTERVAL);

const handleDisconnect = (): void => {
  localMessageBus.emit('shutdown');
  localMessageBus.destroy();
  chromeMessageBus.destroy();
  clearInterval(heartbeatInterval);
  backgroundDisconnected = true;
};

function attemptBackendHandshake() {
  if (!backendInitialized) {
    // tslint:disable-next-line:no-console
    console.log('Attempting handshake with backend', new Date());

    const retry = () => {
      if (backendInitialized || backgroundDisconnected) {
        return;
      }
      handshakeWithBackend();
      setTimeout(retry, 500);
    };
    retry();
  }
}

port.onDisconnect.addListener(handleDisconnect);

const detectAngularMessageBus = new SamePageMessageBus(
  CONTENT_SCRIPT_URI,
  DETECT_ANGULAR_SCRIPT_URI,
);

detectAngularMessageBus.on('detectAngular', (detectionResult) => {
  if (detectionResult.isAngularDevTools !== true) {
    return;
  }

  if (detectionResult.isAngular !== true) {
    return;
  }

  // Defensive check against non html page. Realistically this should never happen.
  if (document.contentType !== 'text/html') {
    return;
  }

  // Inform the background page so it can toggle the popup and icon.
  void chrome.runtime.sendMessage(detectionResult);

  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('app/backend_bundle.js');
  document.documentElement.appendChild(script);
  document.documentElement.removeChild(script);

  detectAngularMessageBus.emit('backendInstalled');

  attemptBackendHandshake();
});

const localMessageBus = new SamePageMessageBus(CONTENT_SCRIPT_URI, BACKEND_URI);
const chromeMessageBus = new ChromeMessageBus(port);

const handshakeWithBackend = (): void => {
  localMessageBus.emit('handshake');
};

// Relaying messages from FE to BE
chromeMessageBus.onAny((topic, args) => {
  localMessageBus.emit(topic, args);
});

// Relaying messages from BE to FE
localMessageBus.onAny((topic, args) => {
  chromeMessageBus.emit(topic, args);
});

localMessageBus.on('backendReady', () => {
  backendInitialized = true;
});

const proxyEventFromWindowToDevToolsExtension = (event: MessageEvent) => {
  if (event.source === window && event.data && event.data.__NG_DEVTOOLS_EVENT__) {
    try {
      chrome.runtime.sendMessage(event.data);
    } catch (e) {
      const {message} = e as Error;
      if (message.includes('Extension context invalidated.')) {
        console.error(
          'Angular DevTools: Disconnecting content script due to invalid extension context. Please reload the page.',
        );
        window.removeEventListener('message', proxyEventFromWindowToDevToolsExtension);
      }
      throw e;
    }
  }
};

window.addEventListener('message', proxyEventFromWindowToDevToolsExtension);
