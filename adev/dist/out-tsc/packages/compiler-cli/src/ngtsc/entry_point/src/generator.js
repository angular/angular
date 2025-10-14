/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/// <reference types="node" />
import ts from 'typescript';
import {dirname, join} from '../../file_system';
import {relativePathBetween} from '../../util/src/path';
export class FlatIndexGenerator {
  entryPoint;
  moduleName;
  flatIndexPath;
  shouldEmit = true;
  constructor(entryPoint, relativeFlatIndexPath, moduleName) {
    this.entryPoint = entryPoint;
    this.moduleName = moduleName;
    this.flatIndexPath =
      join(dirname(entryPoint), relativeFlatIndexPath).replace(/\.js$/, '') + '.ts';
  }
  makeTopLevelShim() {
    const relativeEntryPoint = relativePathBetween(this.flatIndexPath, this.entryPoint);
    const contents = `/**
 * Generated bundle index. Do not edit.
 */

export * from '${relativeEntryPoint}';
`;
    const genFile = ts.createSourceFile(
      this.flatIndexPath,
      contents,
      ts.ScriptTarget.ES2015,
      true,
      ts.ScriptKind.TS,
    );
    if (this.moduleName !== null) {
      genFile.moduleName = this.moduleName;
    }
    return genFile;
  }
}
//# sourceMappingURL=generator.js.map
