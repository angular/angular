/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {areAllEquivalent, Statement} from '../output/output_ast';
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

  isEquivalent(other: GeneratedFile): boolean {
    if (this.genFileUrl !== other.genFileUrl) {
      return false;
    }
    if (this.source) {
      return this.source === other.source;
    }
    if (other.stmts == null) {
      return false;
    }
    // Note: the constructor guarantees that if this.source is not filled,
    // then this.stmts is.
    return areAllEquivalent(this.stmts!, other.stmts!);
  }
}

export function toTypeScript(file: GeneratedFile, preamble: string = ''): string {
  if (!file.stmts) {
    throw new Error(`Illegal state: No stmts present on GeneratedFile ${file.genFileUrl}`);
  }
  return new TypeScriptEmitter().emitStatements(file.genFileUrl, file.stmts, preamble);
}
