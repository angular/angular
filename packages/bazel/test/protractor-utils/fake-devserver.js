/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const http = require('http');
const minimist = require('minimist');

const {port} = minimist(process.argv);
const server = new http.Server();

// Basic request handler so that it could respond to fake requests.
server.on('request', (req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Running');
});

server.listen(port);

console.info('Server running on port:', port);
