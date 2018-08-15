/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

'use strict';

var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');

var PROJECT_ROOT = path.join(__dirname, '../../');

// tslint:disable:no-console
function checkNodeModules(logOutput, purgeIfStale) {
  var yarnCheck = childProcess.spawnSync(
      'yarn check --integrity', {shell: true, cwd: path.resolve(__dirname, '../..')});

  var nodeModulesOK = yarnCheck.status === 0;
  if (nodeModulesOK) {
    if (logOutput) console.log(':-) npm dependencies are looking good!');
  } else {
    if (logOutput) console.error(':-( npm dependencies are stale or in an in unknown state!');
    if (purgeIfStale) {
      if (logOutput) console.log('    purging...');
      _deleteDir(path.join(PROJECT_ROOT, 'node_modules'));
    }
  }

  return nodeModulesOK;
}


/**
 * Custom implementation of recursive `rm` because we can't rely on the state of node_modules to
 * pull in existing module.
 */
function _deleteDir(path) {
  if (fs.existsSync(path)) {
    var subpaths = fs.readdirSync(path);
    subpaths.forEach(function(subpath) {
      var curPath = path + '/' + subpath;
      if (fs.lstatSync(curPath).isDirectory()) {
        _deleteDir(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}


module.exports = checkNodeModules;
