/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {ImportManager} from '../../utils/import_manager';

import {UpdateRecorder} from './update_recorder';
import {findExpressionsToMigrate} from './util';


export class PathMatchTypeTransform {
  private printer = ts.createPrinter();
  private importManager = new ImportManager(this.getUpdateRecorder, this.printer);

  constructor(private getUpdateRecorder: (sf: ts.SourceFile) => UpdateRecorder) {}

  migrate(sourceFiles: ts.SourceFile[]): void {
    for (const sourceFile of sourceFiles) {
      const toMigrate = findExpressionsToMigrate(sourceFile, this.importManager);
      const recorder = this.getUpdateRecorder(sourceFile);
      for (const [oldNode, newNode] of toMigrate) {
        recorder.updateNode(oldNode, newNode, sourceFile);
      }
    }
  }
  /** Records all changes that were made in the import manager. */
  recordChanges() {
    this.importManager.recordChanges();
  }
}
