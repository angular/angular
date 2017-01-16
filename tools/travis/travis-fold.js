/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

module.exports = function travisFoldStart(name) {
  if (process.env.TRAVIS) console.log('travis_fold:start:' + encode(name));

  return function travisFoldEnd() {
    if (process.env.TRAVIS) console.log('travis_fold:end:' + encode(name));
  }
};


function encode(name) {
  return name.replace(/\W/g, '-').replace(/-$/, '');
}
