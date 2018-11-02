/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as protractorUtils from '@angular/bazel/protractor-utils';
import {browser} from 'protractor';

const http = require('http');

exports.config = {
  onPrepare() {
    return protractorUtils.findFreeTcpPort().then(port => {
      const app = new http.Server();

      app.on('request', (req, res) => {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write('Hello World');
        res.end('\n');
      });

      browser.baseUrl = `http://localhost:${port}`;

      return new Promise(resolve => { app.listen(port, () => { resolve(); }); });
    });
  }
};
