/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import ts from 'typescript';

import {absoluteFrom, AbsoluteFsPath, isRooted, ReadonlyFileSystem} from '../../src/ngtsc/file_system';
import {DeclarationNode, KnownDeclaration} from '../../src/ngtsc/reflection';

export type JsonPrimitive = string|number|boolean|null;
export type JsonValue = JsonPrimitive|JsonArray|JsonObject|undefined;
export interface JsonArray extends Array<JsonValue> {}
export interface JsonObject {
  [key: string]: JsonValue;
}

/**
 * A list (`Array`) of partially ordered `T` items.
 *
 * The items in the list are partially ordered in the sense that any element has either the same or
 * higher precedence than any element which appears later in the list. What "higher precedence"
 * means and how it is determined is implementation-dependent.
 *
 * See [PartiallyOrderedSet](https://en.wikipedia.org/wiki/Partially_ordered_set) for more details.
 * (Refraining from using the term "set" here, to avoid confusion with JavaScript's
 * [Set](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set).)
 *
 * NOTE: A plain `Array<T>` is not assignable to a `PartiallyOrderedList<T>`, but a
 *       `PartiallyOrderedList<T>` is assignable to an `Array<T>`.
 */
export interface PartiallyOrderedList<T> extends Array<T> {
  _partiallyOrdered: true;

  map<U>(callbackfn: (value: T, index: number, array: PartiallyOrderedList<T>) => U, thisArg?: any):
      PartiallyOrderedList<U>;
  slice(...args: Parameters<Array<T>['slice']>): PartiallyOrderedList<T>;
}

export function getOriginalSymbol(checker: ts.TypeChecker): (symbol: ts.Symbol) => ts.Symbol {
  return function(symbol: ts.Symbol) {
    return ts.SymbolFlags.Alias & symbol.flags ? checker.getAliasedSymbol(symbol) : symbol;
  };
}

export function isDefined<T>(value: T|undefined|null): value is T {
  return (value !== undefined) && (value !== null);
}

export function getNameText(name: ts.PropertyName|ts.BindingName): string {
  return ts.isIdentifier(name) || ts.isLiteralExpression(name) ? name.text : name.getText();
}

/**
 * Does the given declaration have a name which is an identifier?
 * @param declaration The declaration to test.
 * @returns true if the declaration has an identifier for a name.
 */
export function hasNameIdentifier(declaration: ts.Node): declaration is DeclarationNode&
    {name: ts.Identifier} {
  const namedDeclaration: ts.Node&{name?: ts.Node} = declaration;
  return namedDeclaration.name !== undefined && ts.isIdentifier(namedDeclaration.name);
}

/**
 * Test whether a path is "relative".
 *
 * Relative paths start with `/`, `./` or `../` (or the Windows equivalents); or are simply `.` or
 * `..`.
 */
export function isRelativePath(path: string): boolean {
  return isRooted(path) || /^\.\.?(\/|\\|$)/.test(path);
}

/**
 * A `Map`-like object that can compute and memoize a missing value for any key.
 *
 * The computed values are memoized, so the factory function is not called more than once per key.
 * This is useful for storing values that are expensive to compute and may be used multiple times.
 */
// NOTE:
// Ideally, this class should extend `Map`, but that causes errors in ES5 transpiled code:
// `TypeError: Constructor Map requires 'new'`
export class FactoryMap<K, V> {
  private internalMap: Map<K, V>;

  constructor(private factory: (key: K) => V, entries?: readonly(readonly[K, V])[]|null) {
    this.internalMap = new Map(entries);
  }

  get(key: K): V {
    if (!this.internalMap.has(key)) {
      this.internalMap.set(key, this.factory(key));
    }

    return this.internalMap.get(key)!;
  }

  set(key: K, value: V): void {
    this.internalMap.set(key, value);
  }
}

/**
 * Attempt to resolve a `path` to a file by appending the provided `postFixes`
 * to the `path` and checking if the file exists on disk.
 * @returns An absolute path to the first matching existing file, or `null` if none exist.
 */
export function resolveFileWithPostfixes(
    fs: ReadonlyFileSystem, path: AbsoluteFsPath, postFixes: string[]): AbsoluteFsPath|null {
  for (const postFix of postFixes) {
    const testPath = absoluteFrom(path + postFix);
    if (fs.exists(testPath) && fs.stat(testPath).isFile()) {
      return testPath;
    }
  }
  return null;
}

/**
 * Determine whether a function declaration corresponds with a TypeScript helper function, returning
 * its kind if so or null if the declaration does not seem to correspond with such a helper.
 */
export function getTsHelperFnFromDeclaration(decl: DeclarationNode): KnownDeclaration|null {
  if (!ts.isFunctionDeclaration(decl) && !ts.isVariableDeclaration(decl)) {
    return null;
  }

  if (decl.name === undefined || !ts.isIdentifier(decl.name)) {
    return null;
  }

  return getTsHelperFnFromIdentifier(decl.name);
}

/**
 * Determine whether an identifier corresponds with a TypeScript helper function (based on its
 * name), returning its kind if so or null if the identifier does not seem to correspond with such a
 * helper.
 */
export function getTsHelperFnFromIdentifier(id: ts.Identifier): KnownDeclaration|null {
  switch (stripDollarSuffix(id.text)) {
    case '__assign':
      return KnownDeclaration.TsHelperAssign;
    case '__spread':
      return KnownDeclaration.TsHelperSpread;
    case '__spreadArrays':
      return KnownDeclaration.TsHelperSpreadArrays;
    case '__spreadArray':
      return KnownDeclaration.TsHelperSpreadArray;
    case '__read':
      return KnownDeclaration.TsHelperRead;
    default:
      return null;
  }
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

export function stripExtension(fileName: string): string {
  return fileName.replace(/\..+$/, '');
}

/**
 * Parse the JSON from a `package.json` file.
 *
 * @param packageJsonPath The absolute path to the `package.json` file.
 * @returns JSON from the `package.json` file if it exists and is valid, `null` otherwise.
 */
export function loadJson<T extends JsonObject = JsonObject>(
    fs: ReadonlyFileSystem, packageJsonPath: AbsoluteFsPath): T|null {
  try {
    return JSON.parse(fs.readFile(packageJsonPath)) as T;
  } catch {
    return null;
  }
}

/**
 * Given the parsed JSON of a `package.json` file, try to extract info for a secondary entry-point
 * from the `exports` property. Such info will only be present for packages following Angular
 * Package Format v14+.
 *
 * @param primaryPackageJson The parsed JSON of the primary `package.json` (or `null` if it failed
 *     to be loaded).
 * @param packagePath The absolute path to the containing npm package.
 * @param entryPointPath The absolute path to the secondary entry-point.
 * @returns The `exports` info for the specified entry-point if it exists, `null` otherwise.
 */
export function loadSecondaryEntryPointInfoForApfV14(
    fs: ReadonlyFileSystem, primaryPackageJson: JsonObject|null, packagePath: AbsoluteFsPath,
    entryPointPath: AbsoluteFsPath): JsonObject|null {
  // Check if primary `package.json` has been loaded and has an `exports` property that is an
  // object.
  const exportMap = primaryPackageJson?.exports;
  if (!isExportObject(exportMap)) {
    return null;
  }

  // Find the `exports` key for the secondary entry-point.
  const relativeEntryPointPath = fs.relative(packagePath, entryPointPath);
  const entryPointExportKey = `./${relativeEntryPointPath}`;

  // Read the info for the entry-point.
  const entryPointInfo = exportMap[entryPointExportKey];

  // Check whether the entry-point info exists and is an export map.
  return isExportObject(entryPointInfo) ? entryPointInfo : null;
}

/**
 * Check whether a value read from a JSON file is a Node.js export map (either the top-level one or
 * one for a subpath).
 *
 * In `package.json` files, the `exports` field can be of type `Object | string | string[]`, but APF
 * v14+ uses an object with subpath exports for each entry-point, which in turn are conditional
 * exports (see references below). This function verifies that a value read from the top-level
 * `exports` field or a subpath is of type `Object` (and not `string` or `string[]`).
 *
 * References:
 * - https://nodejs.org/api/packages.html#exports
 * - https://nodejs.org/api/packages.html#subpath-exports
 * - https://nodejs.org/api/packages.html#conditional-exports
 * - https://v14.angular.io/guide/angular-package-format#exports
 *
 * @param thing The value read from the JSON file
 * @returns True if the value is an `Object` (and not an `Array`).
 */
function isExportObject(thing: JsonValue): thing is JsonObject {
  return (typeof thing === 'object') && (thing !== null) && !Array.isArray(thing);
}
