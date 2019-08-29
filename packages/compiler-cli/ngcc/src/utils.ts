/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import {AbsoluteFsPath, FileSystem, absoluteFrom} from '../../src/ngtsc/file_system';

export function getOriginalSymbol(checker: ts.TypeChecker): (symbol: ts.Symbol) => ts.Symbol {
  return function(symbol: ts.Symbol) {
    return ts.SymbolFlags.Alias & symbol.flags ? checker.getAliasedSymbol(symbol) : symbol;
  };
}

export function isDefined<T>(value: T | undefined | null): value is T {
  return (value !== undefined) && (value !== null);
}

export function getNameText(name: ts.PropertyName | ts.BindingName): string {
  return ts.isIdentifier(name) || ts.isLiteralExpression(name) ? name.text : name.getText();
}

/**
 * Parse down the AST and capture all the nodes that satisfy the test.
 * @param node The start node.
 * @param test The function that tests whether a node should be included.
 * @returns a collection of nodes that satisfy the test.
 */
export function findAll<T>(node: ts.Node, test: (node: ts.Node) => node is ts.Node & T): T[] {
  const nodes: T[] = [];
  findAllVisitor(node);
  return nodes;

  function findAllVisitor(n: ts.Node) {
    if (test(n)) {
      nodes.push(n);
    } else {
      n.forEachChild(child => findAllVisitor(child));
    }
  }
}

/**
 * Does the given declaration have a name which is an identifier?
 * @param declaration The declaration to test.
 * @returns true if the declaration has an identifier for a name.
 */
export function hasNameIdentifier(declaration: ts.Declaration): declaration is ts.Declaration&
    {name: ts.Identifier} {
  const namedDeclaration: ts.Declaration&{name?: ts.Node} = declaration;
  return namedDeclaration.name !== undefined && ts.isIdentifier(namedDeclaration.name);
}

export type PathMappings = {
  baseUrl: string,
  paths: {[key: string]: string[]}
};

/**
 * Test whether a path is "relative".
 *
 * Relative paths start with `/`, `./` or `../`; or are simply `.` or `..`.
 */
export function isRelativePath(path: string): boolean {
  return /^\/|^\.\.?($|\/)/.test(path);
}

/**
 * Attempt to resolve a `path` to a file by appending the provided `postFixes`
 * to the `path` and checking if the file exists on disk.
 * @returns An absolute path to the first matching existing file, or `null` if none exist.
 */
export function resolveFileWithPostfixes(
    fs: FileSystem, path: AbsoluteFsPath, postFixes: string[]): AbsoluteFsPath|null {
  for (const postFix of postFixes) {
    const testPath = absoluteFrom(path + postFix);
    if (fs.exists(testPath) && fs.stat(testPath).isFile()) {
      return testPath;
    }
  }
  return null;
}

/**
 * An identifier may become repeated when bundling multiple source files into a single bundle, so
 * bundlers have a strategy of suffixing non-unique identifiers with a suffix like $2. This function
 * strips off such suffixes, so that ngcc deals with the canonical name of an identifier.
 * @param value The value to strip any suffix of, if applicable.
 * @returns The canonical representation of the value, without any suffix.
 */
export function stripDollarSuffix(value: string): string {
  return value.replace(/\$\d+$/, '');
}
