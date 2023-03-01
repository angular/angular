/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Setup tests for Zone without microtask support
System.config({defaultJSExtensions: true});
System.import('../lib/browser/api-util').then(() => {
  System.import('../lib/browser/browser-legacy').then(() => {
    System.import('../lib/browser/browser').then(() => {
      const _global = typeof window !== 'undefined' ? window : self;
      Zone.current.fork({name: 'webworker'}).run(() => {
        const websocket = new WebSocket('ws://localhost:8001');
        websocket.addEventListener('open', () => {
          websocket.onmessage = () => {
            if ((<any>self).Zone.current.name === 'webworker') {
              (<any>self).postMessage('pass');
            } else {
              (<any>self).postMessage('fail');
            }
            websocket.close();
          };
          websocket.send('text');
        });
      });
    }, (e: any) => (<any>self).postMessage(`error ${e.message}`));
  });
});
