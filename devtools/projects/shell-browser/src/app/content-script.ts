/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/// <reference types="chrome"/>

import {ChromeMessageBus} from './chrome-message-bus';
import {SamePageMessageBus} from './same-page-message-bus';

let backgroundDisconnected = false;
let backendInstalled = false;
let backendInitialized = false;

const port = chrome.runtime.connect({
  name: `${document.title || location.href}`,
});

const handleDisconnect = (): void => {
  // console.log('Background disconnected', new Date());
  localMessageBus.emit('shutdown');
  localMessageBus.destroy();
  chromeMessageBus.destroy();
  backgroundDisconnected = true;
};

port.onDisconnect.addListener(handleDisconnect);

const detectAngularMessageBus = new SamePageMessageBus(
  `angular-devtools-content-script-${location.href}`,
  `angular-devtools-detect-angular-${location.href}`,
);

detectAngularMessageBus.on('detectAngular', (detectionResult) => {
  // only install backend once
  if (backendInstalled) {
    return;
  }

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

  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('app/backend_bundle.js');
  document.documentElement.appendChild(script);
  document.documentElement.removeChild(script);
  backendInstalled = true;
});

const localMessageBus = new SamePageMessageBus(
  `angular-devtools-content-script-${location.href}`,
  `angular-devtools-backend-${location.href}`,
);
const chromeMessageBus = new ChromeMessageBus(port);

const handshakeWithBackend = (): void => {
  localMessageBus.emit('handshake');
};

chromeMessageBus.onAny((topic, args) => {
  localMessageBus.emit(topic, args);
});

localMessageBus.onAny((topic, args) => {
  backendInitialized = true;
  chromeMessageBus.emit(topic, args);
});

if (!backendInitialized) {
  // tslint:disable-next-line:no-console
  console.log('Attempting initialization', new Date());

  const retry = () => {
    if (backendInitialized || backgroundDisconnected) {
      return;
    }
    handshakeWithBackend();
    setTimeout(retry, 500);
  };
  retry();
}

const proxyEventFromWindowToDevToolsExtension = (event: MessageEvent) => {
  if (event.source === window && event.data) {
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
