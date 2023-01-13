/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const ws = require('nodejs-websocket');

const conn = ws.connect('ws://localhost:8001', {}, function() {
  conn.send('close');
  conn.close();
});
