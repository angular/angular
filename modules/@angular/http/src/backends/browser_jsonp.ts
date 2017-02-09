/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';

let _nextRequestId = 0;
export const JSONP_HOME = '__ng_jsonp__';
let _jsonpConnections: {[key: string]: any} = null;

const _global: {[key: string]: any} = typeof window == 'object' ? window : {};

function _getJsonpCallbackName(id: string): string {
  return `${JSONP_HOME}${id}_finished`;
}

// Make sure not to evaluate this in a non-browser environment!
@Injectable()
export class BrowserJsonp {
  // Construct a <script> element with the specified URL
  build(url: string): any {
    const node = document.createElement('script');
    node.src = url;
    return node;
  }

  nextRequestID(): string { return `__req${_nextRequestId++}`; }

  requestCallback(id: string): string { return _getJsonpCallbackName(id); }

  exposeConnection(id: string, connection: any): void {
    _global[_getJsonpCallbackName(id)] = connection.finished.bind(connection);
  }

  removeConnection(id: string): void { _global[_getJsonpCallbackName(id)] = null; }

  // Attach the <script> element to the DOM
  send(node: any): void { document.body.appendChild(<Node>(node)); }

  // Remove <script> element from the DOM
  cleanup(node: any): void {
    if (node.parentNode) {
      node.parentNode.removeChild(<Node>(node));
    }
  }
}
