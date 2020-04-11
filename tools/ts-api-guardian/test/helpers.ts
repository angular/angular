/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as path from 'path';

import * as chai from 'chai';

export function unlinkRecursively(file: string) {
  if (fs.statSync(file).isDirectory()) {
    for (const f of fs.readdirSync(file)) {
      unlinkRecursively(path.join(file, f));
    }
    fs.rmdirSync(file);
  } else {
    fs.unlinkSync(file);
  }
}

export function assertFileEqual(actualFile: string, expectedFile: string) {
  chai.assert.equal(
    fs.readFileSync(actualFile).toString(),
    fs.readFileSync(expectedFile).toString()
  );
}
