/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {AbsoluteFsPath, join} from '../../file_system';
import {NoopImportRewriter, Reference, ReferenceEmitter} from '../../imports';
import {ClassDeclaration} from '../../reflection';
import {ImportManager} from '../../translator';

import {TypeCheckBlockMetadata, TypeCheckingConfig} from './api';
import {Environment} from './environment';
import {generateTypeCheckBlock} from './type_check_block';

/**
 * An `Environment` representing the single type-checking file into which most (if not all) Type
 * Check Blocks (TCBs) will be generated.
 *
 * The `TypeCheckFile` hosts multiple TCBs and allows the sharing of declarations (e.g. type
 * constructors) between them. Rather than return such declarations via `getPreludeStatements()`, it
 * hoists them to the top of the generated `ts.SourceFile`.
 */
export class TypeCheckFile extends Environment {
  private nextTcbId = 1;
  private tcbStatements: ts.Statement[] = [];

  constructor(private fileName: string, config: TypeCheckingConfig, refEmitter: ReferenceEmitter) {
    super(
        config, new ImportManager(new NoopImportRewriter(), 'i'), refEmitter,
        ts.createSourceFile(fileName, '', ts.ScriptTarget.Latest, true));
  }

  addTypeCheckBlock(
      ref: Reference<ClassDeclaration<ts.ClassDeclaration>>, meta: TypeCheckBlockMetadata): void {
    const fnId = ts.createIdentifier(`_tcb${this.nextTcbId++}`);
    const fn = generateTypeCheckBlock(this, ref, fnId, meta);
    this.tcbStatements.push(fn);
  }

  render(): ts.SourceFile {
    let source: string = this.importManager.getAllImports(this.fileName)
                             .map(i => `import * as ${i.qualifier} from '${i.specifier}';`)
                             .join('\n') +
        '\n\n';
    const printer = ts.createPrinter();
    source += '\n';
    for (const stmt of this.pipeInstStatements) {
      source += printer.printNode(ts.EmitHint.Unspecified, stmt, this.contextFile) + '\n';
    }
    for (const stmt of this.typeCtorStatements) {
      source += printer.printNode(ts.EmitHint.Unspecified, stmt, this.contextFile) + '\n';
    }
    source += '\n';
    for (const stmt of this.tcbStatements) {
      source += printer.printNode(ts.EmitHint.Unspecified, stmt, this.contextFile) + '\n';
    }

    // Ensure the template type-checking file is an ES module. Otherwise, it's interpreted as some
    // kind of global namespace in TS, which forces a full re-typecheck of the user's program that
    // is somehow more expensive than the initial parse.
    source += '\nexport const IS_A_MODULE = true;\n';

    return ts.createSourceFile(
        this.fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  }

  getPreludeStatements(): ts.Statement[] { return []; }
}

export function typeCheckFilePath(rootDirs: AbsoluteFsPath[]): AbsoluteFsPath {
  const shortest = rootDirs.concat([]).sort((a, b) => a.length - b.length)[0];
  return join(shortest, '__ng_typecheck__.ts');
}
