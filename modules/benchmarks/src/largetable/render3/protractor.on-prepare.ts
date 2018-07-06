/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {OnPrepareConfig, runServer} from '@angular/bazel/protractor-utils';
import {browser} from 'protractor';

export = function(config: OnPrepareConfig) {
  return runServer(config.workspace, config.server, '-port', [])
      .then(serverSpec => {
        const serverUrl = `http://localhost:${serverSpec.port}`;
        // Since the browser restarts in this benchmark we need to set both the browser.baseUrl
        // for the first test and the protractor config.baseUrl for the subsequent tests
        browser.baseUrl = serverUrl;
        return browser.getProcessedConfig().then((config) => config.baseUrl = serverUrl);
      });
};
