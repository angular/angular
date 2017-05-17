/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {sourceUrl} from '../compile_metadata';
import {Statement} from '../output/output_ast';
import {TypeScriptEmitter} from '../output/ts_emitter';

export class GeneratedFile {
  public source: string|null;
  public stmts: Statement[]|null;

  constructor(
      public srcFileUrl: string, public genFileUrl: string, sourceOrStmts: string|Statement[]) {
    if (typeof sourceOrStmts === 'string') {
      this.source = sourceOrStmts;
      this.stmts = null;
    } else {
      this.source = null;
      this.stmts = sourceOrStmts;
    }
  }
}

export function toTypeScript(file: GeneratedFile, preamble: string = ''): string {
  if (!file.stmts) {
    throw new Error(`Illegal state: No stmts present on GeneratedFile ${file.genFileUrl}`);
  }
  return new TypeScriptEmitter().emitStatements(
      sourceUrl(file.srcFileUrl), file.genFileUrl, file.stmts, preamble);
}
