/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {relative} from 'canonical-path';
import {basename} from 'path';
import * as ts from 'typescript';
import {AbsoluteFsPath, FileSystem, join, resolve} from '../../../src/ngtsc/file_system';
import {parseStatementForUmdModule} from '../host/umd_host';
import {Logger} from '../logging/logger';
import {resolveFileWithPostfixes} from '../utils';
import {NgccConfiguration, NgccEntryPointConfig} from './configuration';

/**
 * The possible values for the format of an entry-point.
 */
export type EntryPointFormat = 'esm5' | 'esm2015' | 'umd' | 'commonjs';

/**
 * An object containing information about an entry-point, including paths
 * to each of the possible entry-point formats.
 */
export interface EntryPoint {
  /** The name of the package (e.g. `@angular/core`). */
  name: string;
  /** The parsed package.json file for this entry-point. */
  packageJson: EntryPointPackageJson;
  /** The path to the package that contains this entry-point. */
  package: AbsoluteFsPath;
  /** The path to this entry point. */
  path: AbsoluteFsPath;
  /** The path to a typings (.d.ts) file for this entry-point. */
  typings: AbsoluteFsPath;
  /** Is this EntryPoint compiled with the Angular View Engine compiler? */
  compiledByAngular: boolean;
}

export interface PackageJsonFormatProperties {
  fesm2015?: string;
  fesm5?: string;
  es2015?: string;  // if exists then it is actually FESM2015
  esm2015?: string;
  esm5?: string;
  main?: string;     // UMD
  module?: string;   // if exists then it is actually FESM5
  types?: string;    // Synonymous to `typings` property - see https://bit.ly/2OgWp2H
  typings?: string;  // TypeScript .d.ts files
}

/**
 * The properties that may be loaded from the `package.json` file.
 */
export interface EntryPointPackageJson extends PackageJsonFormatProperties {
  name: string;
  __processed_by_ivy_ngcc__?: {[key: string]: string};
}

export type EntryPointJsonProperty = keyof(PackageJsonFormatProperties);
// We need to keep the elements of this const and the `EntryPointJsonProperty` type in sync.
export const SUPPORTED_FORMAT_PROPERTIES: EntryPointJsonProperty[] =
    ['fesm2015', 'fesm5', 'es2015', 'esm2015', 'esm5', 'main', 'module'];

/**
 * Try to create an entry-point from the given paths and properties.
 *
 * @param packagePath the absolute path to the containing npm package
 * @param entryPointPath the absolute path to the potential entry-point.
 * @returns An entry-point if it is valid, `null` otherwise.
 */
export function getEntryPointInfo(
    fs: FileSystem, config: NgccConfiguration, logger: Logger, packagePath: AbsoluteFsPath,
    entryPointPath: AbsoluteFsPath): EntryPoint|null {
  const packageJsonPath = resolve(entryPointPath, 'package.json');
  const entryPointConfig = config.getConfig(packagePath).entryPoints[entryPointPath];
  if (entryPointConfig === undefined && !fs.exists(packageJsonPath)) {
    return null;
  }

  if (entryPointConfig !== undefined && entryPointConfig.ignore === true) {
    return null;
  }

  const loadedEntryPointPackageJson =
      loadEntryPointPackage(fs, logger, packageJsonPath, entryPointConfig !== undefined);
  const entryPointPackageJson = mergeConfigAndPackageJson(
      loadedEntryPointPackageJson, entryPointConfig, packagePath, entryPointPath);
  if (entryPointPackageJson === null) {
    return null;
  }

  // We must have a typings property
  const typings = entryPointPackageJson.typings || entryPointPackageJson.types ||
      guessTypingsFromPackageJson(fs, entryPointPath, entryPointPackageJson);
  if (!typings) {
    return null;
  }

  // An entry-point is assumed to be compiled by Angular if there is either:
  // * a `metadata.json` file next to the typings entry-point
  // * a custom config for this entry-point
  const metadataPath = resolve(entryPointPath, typings.replace(/\.d\.ts$/, '') + '.metadata.json');
  const compiledByAngular = entryPointConfig !== undefined || fs.exists(metadataPath);

  const entryPointInfo: EntryPoint = {
    name: entryPointPackageJson.name,
    packageJson: entryPointPackageJson,
    package: packagePath,
    path: entryPointPath,
    typings: resolve(entryPointPath, typings), compiledByAngular,
  };

  return entryPointInfo;
}

/**
 * Convert a package.json property into an entry-point format.
 *
 * @param property The property to convert to a format.
 * @returns An entry-point format or `undefined` if none match the given property.
 */
export function getEntryPointFormat(
    fs: FileSystem, entryPoint: EntryPoint, property: string): EntryPointFormat|undefined {
  switch (property) {
    case 'fesm2015':
      return 'esm2015';
    case 'fesm5':
      return 'esm5';
    case 'es2015':
      return 'esm2015';
    case 'esm2015':
      return 'esm2015';
    case 'esm5':
      return 'esm5';
    case 'main':
      const mainFile = entryPoint.packageJson['main'];
      if (mainFile === undefined) {
        return undefined;
      }
      const pathToMain = join(entryPoint.path, mainFile);
      return isUmdModule(fs, pathToMain) ? 'umd' : 'commonjs';
    case 'module':
      return 'esm5';
    default:
      return undefined;
  }
}

/**
 * Parses the JSON from a package.json file.
 * @param packageJsonPath the absolute path to the package.json file.
 * @returns JSON from the package.json file if it is valid, `null` otherwise.
 */
function loadEntryPointPackage(
    fs: FileSystem, logger: Logger, packageJsonPath: AbsoluteFsPath,
    hasConfig: boolean): EntryPointPackageJson|null {
  try {
    return JSON.parse(fs.readFile(packageJsonPath));
  } catch (e) {
    if (!hasConfig) {
      // We may have run into a package.json with unexpected symbols
      logger.warn(`Failed to read entry point info from ${packageJsonPath} with error ${e}.`);
    }
    return null;
  }
}

function isUmdModule(fs: FileSystem, sourceFilePath: AbsoluteFsPath): boolean {
  const resolvedPath = resolveFileWithPostfixes(fs, sourceFilePath, ['', '.js', '/index.js']);
  if (resolvedPath === null) {
    return false;
  }
  const sourceFile =
      ts.createSourceFile(sourceFilePath, fs.readFile(resolvedPath), ts.ScriptTarget.ES5);
  return sourceFile.statements.length > 0 &&
      parseStatementForUmdModule(sourceFile.statements[0]) !== null;
}

function mergeConfigAndPackageJson(
    entryPointPackageJson: EntryPointPackageJson | null,
    entryPointConfig: NgccEntryPointConfig | undefined, packagePath: AbsoluteFsPath,
    entryPointPath: AbsoluteFsPath): EntryPointPackageJson|null {
  if (entryPointPackageJson !== null) {
    if (entryPointConfig === undefined) {
      return entryPointPackageJson;
    } else {
      return {...entryPointPackageJson, ...entryPointConfig.override};
    }
  } else {
    if (entryPointConfig === undefined) {
      return null;
    } else {
      const name = `${basename(packagePath)}/${relative(packagePath, entryPointPath)}`;
      return {name, ...entryPointConfig.override};
    }
  }
}

function guessTypingsFromPackageJson(
    fs: FileSystem, entryPointPath: AbsoluteFsPath,
    entryPointPackageJson: EntryPointPackageJson): AbsoluteFsPath|null {
  for (const prop of SUPPORTED_FORMAT_PROPERTIES) {
    const field = entryPointPackageJson[prop];
    if (typeof field !== 'string') {
      // Some crazy packages have things like arrays in these fields!
      continue;
    }
    const relativeTypingsPath = field.replace(/\.js$/, '.d.ts');
    const typingsPath = resolve(entryPointPath, relativeTypingsPath);
    if (fs.exists(typingsPath)) {
      return typingsPath;
    }
  }
  return null;
}
