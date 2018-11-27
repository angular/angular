/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ImportManager, translateType} from '../../translator';

import {CompileResult} from './api';



/**
 * Processes .d.ts file text and adds static field declarations, with types.
 */
export class DtsFileTransformer {
  private ivyFields = new Map<string, CompileResult[]>();
  private imports: ImportManager;

  constructor(private coreImportsFrom: ts.SourceFile|null, importPrefix?: string) {
    this.imports = new ImportManager(coreImportsFrom !== null, importPrefix);
  }

  /**
   * Track that a static field was added to the code for a class.
   */
  recordStaticField(name: string, decls: CompileResult[]): void { this.ivyFields.set(name, decls); }

  /**
   * Process the .d.ts text for a file and add any declarations which were recorded.
   */
  transform(dts: string, tsPath: string): string {
    const dtsFile =
        ts.createSourceFile('out.d.ts', dts, ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);

    for (let i = dtsFile.statements.length - 1; i >= 0; i--) {
      const stmt = dtsFile.statements[i];
      if (ts.isClassDeclaration(stmt) && stmt.name !== undefined &&
          this.ivyFields.has(stmt.name.text)) {
        const decls = this.ivyFields.get(stmt.name.text) !;
        const before = dts.substring(0, stmt.end - 1);
        const after = dts.substring(stmt.end - 1);

        dts = before +
            decls
                .map(decl => {
                  const type = translateType(decl.type, this.imports);
                  return `    static ${decl.name}: ${type};\n`;
                })
                .join('') +
            after;
      }
    }

    const imports = this.imports.getAllImports(tsPath, this.coreImportsFrom);
    if (imports.length !== 0) {
      dts = imports.map(i => `import * as ${i.as} from '${i.name}';\n`).join('') + dts;
    }

    return dts;
  }
}
