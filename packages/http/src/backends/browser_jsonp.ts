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
let _jsonpConnections: {[key: string]: any}|null = null;

function _getJsonpConnections(): {[key: string]: any} {
  const w: {[key: string]: any} = typeof window == 'object' ? window : {};
  if (_jsonpConnections === null) {
    _jsonpConnections = w[JSONP_HOME] = {};
  }
  return _jsonpConnections;
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

  requestCallback(id: string): string { return `${JSONP_HOME}.${id}.finished`; }

  exposeConnection(id: string, connection: any) {
    const connections = _getJsonpConnections();
    connections[id] = connection;
  }

  removeConnection(id: string) {
    const connections = _getJsonpConnections();
    connections[id] = null;
  }

  // Attach the <script> element to the DOM
  send(node: any) { document.body.appendChild(<Node>(node)); }

  // Remove <script> element from the DOM
  cleanup(node: any) {
    if (node.parentNode) {
      node.parentNode.removeChild(<Node>(node));
    }
  }
}
