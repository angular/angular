/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {AddStaticFieldInstruction} from './api';
import {ImportManager, translateType} from './translator';



/**
 * Processes .d.ts file text and adds static field declarations, with types.
 */
export class DtsFileTransformer {
  private ivyFields = new Map<string, AddStaticFieldInstruction>();
  private imports = new ImportManager();

  /**
   * Track that a static field was added to the code for a class.
   */
  recordStaticField(name: string, decl: AddStaticFieldInstruction): void {
    this.ivyFields.set(name, decl);
  }

  /**
   * Process the .d.ts text for a file and add any declarations which were recorded.
   */
  transform(dts: string): string {
    const dtsFile =
        ts.createSourceFile('out.d.ts', dts, ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);

    for (let i = dtsFile.statements.length - 1; i >= 0; i--) {
      const stmt = dtsFile.statements[i];
      if (ts.isClassDeclaration(stmt) && stmt.name !== undefined &&
          this.ivyFields.has(stmt.name.text)) {
        const desc = this.ivyFields.get(stmt.name.text) !;
        const before = dts.substring(0, stmt.end - 1);
        const after = dts.substring(stmt.end - 1);
        const type = translateType(desc.type, this.imports);
        dts = before + `    static ${desc.field}: ${type};\n` + after;
      }
    }

    const imports = this.imports.getAllImports();
    if (imports.length !== 0) {
      dts = imports.map(i => `import * as ${i.as} from '${i.name}';\n`).join() + dts;
    }

    return dts;
  }
}