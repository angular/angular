/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {PathManipulation} from '@angular/compiler-cli/src/ngtsc/file_system';
import MagicString from 'magic-string';
import * as ts from 'typescript';

import {Reexport} from '../../../src/ngtsc/imports';
import {Import, ImportManager} from '../../../src/ngtsc/translator';
import {ExportInfo} from '../analysis/private_declarations_analyzer';
import {isRequireCall} from '../host/commonjs_umd_utils';
import {NgccReflectionHost} from '../host/ngcc_host';

import {Esm5RenderingFormatter} from './esm5_rendering_formatter';
import {stripExtension} from './utils';

/**
 * A RenderingFormatter that works with CommonJS files, instead of `import` and `export` statements
 * the module is an IIFE with a factory function call with dependencies, which are defined in a
 * wrapper function for AMD, CommonJS and global module formats.
 */
export class CommonJsRenderingFormatter extends Esm5RenderingFormatter {
  constructor(fs: PathManipulation, protected commonJsHost: NgccReflectionHost, isCore: boolean) {
    super(fs, commonJsHost, isCore);
  }

  /**
   *  Add the imports below any in situ imports as `require` calls.
   */
  addImports(output: MagicString, imports: Import[], file: ts.SourceFile): void {
    // Avoid unnecessary work if there are no imports to add.
    if (imports.length === 0) {
      return;
    }

    const insertionPoint = this.findEndOfImports(file);
    const renderedImports =
        imports.map(i => `var ${i.qualifier.text} = require('${i.specifier}');\n`).join('');
    output.appendLeft(insertionPoint, renderedImports);
  }

  /**
   * Add the exports to the bottom of the file.
   */
  addExports(
      output: MagicString, entryPointBasePath: string, exports: ExportInfo[],
      importManager: ImportManager, file: ts.SourceFile): void {
    exports.forEach(e => {
      const basePath = stripExtension(e.from);
      const relativePath = './' + this.fs.relative(this.fs.dirname(entryPointBasePath), basePath);
      const namedImport = entryPointBasePath !== basePath ?
          importManager.generateNamedImport(relativePath, e.identifier) :
          {symbol: e.identifier, moduleImport: null};
      const importNamespace = namedImport.moduleImport ? `${namedImport.moduleImport.text}.` : '';
      const exportStr = `\nexports.${e.identifier} = ${importNamespace}${namedImport.symbol};`;
      output.append(exportStr);
    });
  }

  addDirectExports(
      output: MagicString, exports: Reexport[], importManager: ImportManager,
      file: ts.SourceFile): void {
    for (const e of exports) {
      const namedImport = importManager.generateNamedImport(e.fromModule, e.symbolName);
      const importNamespace = namedImport.moduleImport ? `${namedImport.moduleImport.text}.` : '';
      const exportStr = `\nexports.${e.asAlias} = ${importNamespace}${namedImport.symbol};`;
      output.append(exportStr);
    }
  }

  protected findEndOfImports(sf: ts.SourceFile): number {
    for (const statement of sf.statements) {
      if (ts.isExpressionStatement(statement) && isRequireCall(statement.expression)) {
        continue;
      }
      const declarations = ts.isVariableStatement(statement) ?
          Array.from(statement.declarationList.declarations) :
          [];
      if (declarations.some(d => !d.initializer || !isRequireCall(d.initializer))) {
        return statement.getStart();
      }
    }
    return 0;
  }
}
