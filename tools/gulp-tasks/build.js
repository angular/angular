/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

module.exports = {
  // build everything and generate bundles
  'all': (gulp) => (done) => execBuild(done),
  // same as all without the bundling part - faster / lower memory usage
  'no-bundle': (gulp) => (done) => execBuild(done, '--bundle=false'),
};

function execBuild(done, args = '') {
  const path = require('path');
  const childProcess = require('child_process');
  // increase maxbuffer to address out of memory exception when running certain tasks
  childProcess.exec(path.join(__dirname, `../../build.sh ${args}`), {maxBuffer: 300 * 1024}, done);
}