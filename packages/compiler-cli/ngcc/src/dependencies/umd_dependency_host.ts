/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {AbsoluteFsPath} from '../../../src/ngtsc/file_system';
import {getImportsOfUmdModule, parseStatementForUmdModule} from '../host/umd_host';

import {hasRequireCalls} from './commonjs_dependency_host';
import {DependencyHostBase} from './dependency_host';

/**
 * Helper functions for computing dependencies.
 */
export class UmdDependencyHost extends DependencyHostBase {
  protected override canSkipFile(fileContents: string): boolean {
    return !hasRequireCalls(fileContents);
  }

  protected override extractImports(file: AbsoluteFsPath, fileContents: string): Set<string> {
    // Parse the source into a TypeScript AST and then walk it looking for imports and re-exports.
    const sf =
        ts.createSourceFile(file, fileContents, ts.ScriptTarget.ES2015, false, ts.ScriptKind.JS);

    if (sf.statements.length !== 1) {
      return new Set();
    }

    const umdModule = parseStatementForUmdModule(sf.statements[0]);
    const umdImports = umdModule && getImportsOfUmdModule(umdModule);
    if (umdImports === null) {
      return new Set();
    }

    return new Set(umdImports.map(i => i.path));
  }
}
