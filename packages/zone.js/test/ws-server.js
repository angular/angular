/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const ws = require('nodejs-websocket');

// simple echo server
const server = ws.createServer(function(conn) {
                   conn.on('text', function(str) {
                     if (str === 'close') {
                       server.close();
                       return;
                     }
                     conn.sendText(str.toString());
                   });
                 }).listen(8001);
