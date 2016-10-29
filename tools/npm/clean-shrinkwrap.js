#!/usr/bin/env node
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * this script is just a temporary solution to deal with the issue of npm outputting the npm
 * shrinkwrap file in an unstable manner.
 *
 * See: https://github.com/npm/npm/issues/3581
 */

const fs = require('fs');
const path = require('path');


function cleanModule(moduleRecord) {
  // keep `resolve` properties for git dependencies, delete otherwise
  delete moduleRecord.from;
  if (!(moduleRecord.resolved && moduleRecord.resolved.match(/^git(\+[a-z]+)?:\/\//))) {
    delete moduleRecord.resolved;
  }

  if (moduleRecord.dependencies) {
    Object.keys(moduleRecord.dependencies)
        .forEach((name) => cleanModule(moduleRecord.dependencies[name]));
  }
}


// console.log('Reading npm-shrinkwrap.json');
const shrinkwrap = require('../../npm-shrinkwrap.json');

// console.log('Cleaning shrinkwrap object');
cleanModule(shrinkwrap);

const cleanShrinkwrapPath = path.join(__dirname, '..', '..', 'npm-shrinkwrap.clean.json');
console.log('writing npm-shrinkwrap.clean.json');
fs.writeFileSync(cleanShrinkwrapPath, JSON.stringify(shrinkwrap, null, 2) + '\n');
