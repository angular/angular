
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as http_server from 'http-server';
import * as path from 'path';
import * as protractorLauncher from 'protractor/built/launcher';
import {sendRequest} from 'selenium-webdriver/http';
import {setFlagsFromString} from 'v8';

Error.stackTraceLimit = Infinity;

if (require.main === module) {
  const runfiles = process.env.RUNFILES;
  const target = process.env.BAZEL_TARGET;
  const args = process.argv.slice(2) as[string, string];
  main(args[0], args[1], 'angular', runfiles, target) ? 0 : 1;
}


function main(
    confPath: string, serverLabel: string, workspace: string, runfiles: string, target: string) {
  // compute the base directory for the server
  const selfBase = target.split(':')[0];
  const serverRelative = path.join('/' + selfBase, serverLabel.split(':')[0]).substr(1);
  const serverBasePath = path.join(runfiles, workspace, serverRelative);

  // Load the protractor config file and extract the listen port.
  const protractorConfig = require(confPath).config;
  const port = 1 * (protractorConfig.baseUrl || '::5432/').split(':')[2].split('/')[0];

  // Start the server on the port from the protractor config
  const server = http_server.createServer({root: serverBasePath, showDir: true});
  server.listen(port);

  // protractorLauncher sets the exit code.
  protractorLauncher.init(confPath.replace(workspace, '.'), []);
}
