/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {AbsoluteFsPath} from '../../../src/ngtsc/file_system';
import {isRequireCall, isWildcardReexportStatement, RequireCall} from '../host/commonjs_umd_utils';

import {DependencyHostBase} from './dependency_host';
import {ResolvedDeepImport, ResolvedRelativeModule} from './module_resolver';

/**
 * Helper functions for computing dependencies.
 */
export class CommonJsDependencyHost extends DependencyHostBase {
  /**
   * Compute the dependencies of the given file.
   *
   * @param file An absolute path to the file whose dependencies we want to get.
   * @param dependencies A set that will have the absolute paths of resolved entry points added to
   * it.
   * @param missing A set that will have the dependencies that could not be found added to it.
   * @param deepImports A set that will have the import paths that exist but cannot be mapped to
   * entry-points, i.e. deep-imports.
   * @param alreadySeen A set that is used to track internal dependencies to prevent getting stuck
   * in a circular dependency loop.
   */
  protected recursivelyCollectDependencies(
      file: AbsoluteFsPath, dependencies: Set<AbsoluteFsPath>, missing: Set<string>,
      deepImports: Set<AbsoluteFsPath>, alreadySeen: Set<AbsoluteFsPath>): void {
    const fromContents = this.fs.readFile(file);

    if (!this.hasRequireCalls(fromContents)) {
      // Avoid parsing the source file as there are no imports.
      return;
    }

    // Parse the source into a TypeScript AST and then walk it looking for imports and re-exports.
    const sf =
        ts.createSourceFile(file, fromContents, ts.ScriptTarget.ES2015, false, ts.ScriptKind.JS);
    const requireCalls: RequireCall[] = [];

    for (const stmt of sf.statements) {
      if (ts.isVariableStatement(stmt)) {
        // Regular import(s):
        // `var foo = require('...')` or `var foo = require('...'), bar = require('...')`
        const declarations = stmt.declarationList.declarations;
        for (const declaration of declarations) {
          if ((declaration.initializer !== undefined) && isRequireCall(declaration.initializer)) {
            requireCalls.push(declaration.initializer);
          }
        }
      } else if (ts.isExpressionStatement(stmt)) {
        if (isRequireCall(stmt.expression)) {
          // Import for the side-effects only:
          // `require('...')`
          requireCalls.push(stmt.expression);
        } else if (isWildcardReexportStatement(stmt)) {
          // Re-export in one of the following formats:
          // - `__export(require('...'))`
          // - `__export(<identifier>)`
          // - `tslib_1.__exportStar(require('...'), exports)`
          // - `tslib_1.__exportStar(<identifier>, exports)`
          const firstExportArg = stmt.expression.arguments[0];

          if (isRequireCall(firstExportArg)) {
            // Re-export with `require()` call:
            // `__export(require('...'))` or `tslib_1.__exportStar(require('...'), exports)`
            requireCalls.push(firstExportArg);
          }
        } else if (
            ts.isBinaryExpression(stmt.expression) &&
            (stmt.expression.operatorToken.kind === ts.SyntaxKind.EqualsToken)) {
          if (isRequireCall(stmt.expression.right)) {
            // Import with assignment. E.g.:
            // `exports.foo = require('...')`
            requireCalls.push(stmt.expression.right);
          } else if (ts.isObjectLiteralExpression(stmt.expression.right)) {
            // Import in object literal. E.g.:
            // `module.exports = {foo: require('...')}`
            stmt.expression.right.properties.forEach(prop => {
              if (ts.isPropertyAssignment(prop) && isRequireCall(prop.initializer)) {
                requireCalls.push(prop.initializer);
              }
            });
          }
        }
      }
    }

    const importPaths = new Set(requireCalls.map(call => call.arguments[0].text));
    for (const importPath of importPaths) {
      const resolvedModule = this.moduleResolver.resolveModuleImport(importPath, file);
      if (resolvedModule === null) {
        missing.add(importPath);
      } else if (resolvedModule instanceof ResolvedRelativeModule) {
        const internalDependency = resolvedModule.modulePath;
        if (!alreadySeen.has(internalDependency)) {
          alreadySeen.add(internalDependency);
          this.recursivelyCollectDependencies(
              internalDependency, dependencies, missing, deepImports, alreadySeen);
        }
      } else if (resolvedModule instanceof ResolvedDeepImport) {
        deepImports.add(resolvedModule.importPath);
      } else {
        dependencies.add(resolvedModule.entryPointPath);
      }
    }
  }

  /**
   * Check whether a source file needs to be parsed for imports.
   * This is a performance short-circuit, which saves us from creating
   * a TypeScript AST unnecessarily.
   *
   * @param source The content of the source file to check.
   *
   * @returns false if there are definitely no require calls
   * in this file, true otherwise.
   */
  private hasRequireCalls(source: string): boolean {
    return /require\(['"]/.test(source);
  }
}
