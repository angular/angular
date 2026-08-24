/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ImportManager} from '../../translator';

export class TcbImportManager extends ImportManager {
  private _nextUniqueIndex = 0;
  private _namespaceImports = new Map<string, string>(); // moduleName -> alias

  private generateAlias(moduleName: string): string {
    if (!this._namespaceImports.has(moduleName)) {
      const prefix = (this as any).config.namespaceImportPrefix;
      this._namespaceImports.set(moduleName, `${prefix}${this._nextUniqueIndex++}`);
    }
    return this._namespaceImports.get(moduleName)!;
  }

  override addImport(request: {
    exportModuleSpecifier: string;
    exportSymbolName: string | null;
  }): any {
    const alias = this.generateAlias(request.exportModuleSpecifier);
    if (request.exportSymbolName === null) {
      return {kind: 80 /* ts.SyntaxKind.Identifier */, text: alias, escapedText: alias} as any;
    } else {
      return {
        kind: 212 /* ts.SyntaxKind.PropertyAccessExpression */,
        expression: {kind: 80 /* ts.SyntaxKind.Identifier */, text: alias, escapedText: alias},
        name: {
          kind: 80 /* ts.SyntaxKind.Identifier */,
          text: request.exportSymbolName,
          escapedText: request.exportSymbolName,
        },
      } as any;
    }
  }

  override finalize(): any {
    let result = '';
    for (const [moduleName, alias] of this._namespaceImports.entries()) {
      result += `import * as ${alias} from '${moduleName}';`;
    }
    return result;
  }
}
