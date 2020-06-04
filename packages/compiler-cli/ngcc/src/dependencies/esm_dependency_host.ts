/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import {AbsoluteFsPath} from '../../../src/ngtsc/file_system';
import {DependencyHostBase} from './dependency_host';

/**
 * Helper functions for computing dependencies.
 */
export class EsmDependencyHost extends DependencyHostBase {
  protected canSkipFile(fileContents: string): boolean {
    return !hasImportOrReexportStatements(fileContents);
  }

  protected extractImports(file: AbsoluteFsPath, fileContents: string): Set<string> {
    const imports: string[] = [];
    // Parse the source into a TypeScript AST and then walk it looking for imports and re-exports.
    const sf =
        ts.createSourceFile(file, fileContents, ts.ScriptTarget.ES2015, false, ts.ScriptKind.JS);
    return new Set(sf.statements
                       // filter out statements that are not imports or reexports
                       .filter(isStringImportOrReexport)
                       // Grab the id of the module that is being imported
                       .map(stmt => stmt.moduleSpecifier.text));
  }
}

/**
 * Check whether a source file needs to be parsed for imports.
 * This is a performance short-circuit, which saves us from creating
 * a TypeScript AST unnecessarily.
 *
 * @param source The content of the source file to check.
 *
 * @returns false if there are definitely no import or re-export statements
 * in this file, true otherwise.
 */
export function hasImportOrReexportStatements(source: string): boolean {
  return /(?:import|export)[\s\S]+?(["'])(?:(?:\\\1|.)*?)\1/.test(source);
}


/**
 * Check whether the given statement is an import with a string literal module specifier.
 * @param stmt the statement node to check.
 * @returns true if the statement is an import with a string literal module specifier.
 */
export function isStringImportOrReexport(stmt: ts.Statement): stmt is ts.ImportDeclaration&
    {moduleSpecifier: ts.StringLiteral} {
  return ts.isImportDeclaration(stmt) ||
      ts.isExportDeclaration(stmt) && !!stmt.moduleSpecifier &&
      ts.isStringLiteral(stmt.moduleSpecifier);
}
