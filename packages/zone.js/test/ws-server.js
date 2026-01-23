/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

const {WebSocketServer} = require('ws');

// simple echo server
const wss = new WebSocketServer({port: 8001});
wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    if (data.toString() === 'close') {
      wss.close();
      return;
    }
    ws.send(data);
  });
});
