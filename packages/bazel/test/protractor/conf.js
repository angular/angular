/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @fileoverview A demo of what a user's conf.js file might look like.
 */
const http = require('http');

const PORT = 3000;

exports.config = {
  baseUrl: `http://localhost:${PORT}`,
  onPrepare() {
    const app = new http.Server();

    app.on('request', (req, res) => {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.write('Hello World');
      res.end('\n');
    });

    return new Promise(resolve => { app.listen(PORT, () => { resolve(); }); });
  }
};
