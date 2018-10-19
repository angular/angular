/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const TS_FILE = /\.tsx?$/;
const D_TS_FILE = /\.d\.ts$/;

export function isNonDeclarationTsFile(file: string): boolean {
  return TS_FILE.exec(file) !== null && D_TS_FILE.exec(file) === null;
}
