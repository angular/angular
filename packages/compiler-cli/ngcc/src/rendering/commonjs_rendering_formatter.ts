/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {dirname, relative} from 'canonical-path';
import * as ts from 'typescript';
import MagicString from 'magic-string';
import {Import, ImportManager} from '../../../src/ngtsc/translator';
import {ExportInfo} from '../analysis/private_declarations_analyzer';
import {isRequireCall} from '../host/commonjs_host';
import {NgccReflectionHost} from '../host/ngcc_host';
import {Esm5RenderingFormatter} from './esm5_rendering_formatter';
import {stripExtension} from './utils';

/**
 * A RenderingFormatter that works with CommonJS files, instead of `import` and `export` statements
 * the module is an IIFE with a factory function call with dependencies, which are defined in a
 * wrapper function for AMD, CommonJS and global module formats.
 */
export class CommonJsRenderingFormatter extends Esm5RenderingFormatter {
  constructor(protected commonJsHost: NgccReflectionHost, isCore: boolean) {
    super(commonJsHost, isCore);
  }

  /**
   *  Add the imports below any in situ imports as `require` calls.
   */
  addImports(output: MagicString, imports: Import[], file: ts.SourceFile): void {
    const insertionPoint = this.findEndOfImports(file);
    const renderedImports =
        imports.map(i => `var ${i.qualifier} = require('${i.specifier}');\n`).join('');
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
      const relativePath = './' + relative(dirname(entryPointBasePath), basePath);
      const namedImport = entryPointBasePath !== basePath ?
          importManager.generateNamedImport(relativePath, e.identifier) :
          {symbol: e.identifier, moduleImport: null};
      const importNamespace = namedImport.moduleImport ? `${namedImport.moduleImport}.` : '';
      const exportStr = `\nexports.${e.identifier} = ${importNamespace}${namedImport.symbol};`;
      output.append(exportStr);
    });
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
