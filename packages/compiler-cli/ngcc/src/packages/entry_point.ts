/**
 * @license
 * Copyright Google LLC All Rights Reserved.
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
export type EntryPointFormat = 'esm5'|'esm2015'|'umd'|'commonjs';

/**
 * An object containing information about an entry-point, including paths
 * to each of the possible entry-point formats.
 */
export interface EntryPoint extends JsonObject {
  /** The name of the entry-point (e.g. `@angular/core` or `@angular/common/http`). */
  name: string;
  /** The path to this entry point. */
  path: AbsoluteFsPath;
  /** The path to the package that contains this entry-point. */
  packagePath: AbsoluteFsPath;
  /** The parsed package.json file for this entry-point. */
  packageJson: EntryPointPackageJson;
  /** The path to a typings (.d.ts) file for this entry-point. */
  typings: AbsoluteFsPath;
  /** Is this EntryPoint compiled with the Angular View Engine compiler? */
  compiledByAngular: boolean;
  /** Should ngcc ignore missing dependencies and process this entrypoint anyway? */
  ignoreMissingDependencies: boolean;
  /** Should ngcc generate deep re-exports for this entrypoint? */
  generateDeepReexports: boolean;
}

export type JsonPrimitive = string|number|boolean|null;
export type JsonValue = JsonPrimitive|JsonArray|JsonObject|undefined;
export interface JsonArray extends Array<JsonValue> {}
export interface JsonObject {
  [key: string]: JsonValue;
}

export interface PackageJsonFormatPropertiesMap {
  browser?: string;
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

export type PackageJsonFormatProperties = keyof PackageJsonFormatPropertiesMap;

/**
 * The properties that may be loaded from the `package.json` file.
 */
export interface EntryPointPackageJson extends JsonObject, PackageJsonFormatPropertiesMap {
  name: string;
  version?: string;
  scripts?: Record<string, string>;
  __processed_by_ivy_ngcc__?: Record<string, string>;
}

export type EntryPointJsonProperty = Exclude<PackageJsonFormatProperties, 'types'|'typings'>;
// We need to keep the elements of this const and the `EntryPointJsonProperty` type in sync.
export const SUPPORTED_FORMAT_PROPERTIES: EntryPointJsonProperty[] =
    ['fesm2015', 'fesm5', 'es2015', 'esm2015', 'esm5', 'main', 'module', 'browser'];


/**
 * The path does not represent an entry-point, i.e. there is no package.json at the path and there
 * is no config to force an entry-point.
 */
export const NO_ENTRY_POINT = 'no-entry-point';

/**
 * The path represents an entry-point that is `ignored` by an ngcc config.
 */
export const IGNORED_ENTRY_POINT = 'ignored-entry-point';

/**
 * The path has a package.json, but it is not a valid entry-point for ngcc processing.
 */
export const INCOMPATIBLE_ENTRY_POINT = 'incompatible-entry-point';

/**
 * The result of calling `getEntryPointInfo()`.
 *
 * This will be an `EntryPoint` object if an Angular entry-point was identified;
 * Otherwise it will be a flag indicating one of:
 * * NO_ENTRY_POINT - the path is not an entry-point or ngcc is configured to ignore it
 * * INCOMPATIBLE_ENTRY_POINT - the path was a non-processable entry-point that should be searched
 * for sub-entry-points
 */
export type GetEntryPointResult =
    EntryPoint|typeof IGNORED_ENTRY_POINT|typeof INCOMPATIBLE_ENTRY_POINT|typeof NO_ENTRY_POINT;


/**
 * Try to create an entry-point from the given paths and properties.
 *
 * @param packagePath the absolute path to the containing npm package
 * @param entryPointPath the absolute path to the potential entry-point.
 * @returns
 * - An entry-point if it is valid and not ignored.
 * - `NO_ENTRY_POINT` when there is no package.json at the path and there is no config to force an
 *   entry-point,
 * - `IGNORED_ENTRY_POINT` when the entry-point is ignored by an ngcc config.
 * - `INCOMPATIBLE_ENTRY_POINT` when there is a package.json but it is not a valid Angular compiled
 *   entry-point.
 */
export function getEntryPointInfo(
    fs: FileSystem, config: NgccConfiguration, logger: Logger, packagePath: AbsoluteFsPath,
    entryPointPath: AbsoluteFsPath): GetEntryPointResult {
  const packagePackageJsonPath = resolve(packagePath, 'package.json');
  const entryPointPackageJsonPath = resolve(entryPointPath, 'package.json');
  const loadedPackagePackageJson = loadPackageJson(fs, packagePackageJsonPath);
  const loadedEntryPointPackageJson = (packagePackageJsonPath === entryPointPackageJsonPath) ?
      loadedPackagePackageJson :
      loadPackageJson(fs, entryPointPackageJsonPath);
  const packageVersion = getPackageVersion(loadedPackagePackageJson);
  const entryPointConfig =
      config.getPackageConfig(packagePath, packageVersion).entryPoints[entryPointPath];
  let entryPointPackageJson: EntryPointPackageJson;

  if (entryPointConfig === undefined) {
    if (!fs.exists(entryPointPackageJsonPath)) {
      // No `package.json` and no config.
      return NO_ENTRY_POINT;
    } else if (loadedEntryPointPackageJson === null) {
      // `package.json` exists but could not be parsed and there is no redeeming config.
      logger.warn(`Failed to read entry point info from invalid 'package.json' file: ${
          entryPointPackageJsonPath}`);

      return INCOMPATIBLE_ENTRY_POINT;
    } else {
      entryPointPackageJson = loadedEntryPointPackageJson;
    }
  } else if (entryPointConfig.ignore === true) {
    // Explicitly ignored entry-point.
    return IGNORED_ENTRY_POINT;
  } else {
    entryPointPackageJson = mergeConfigAndPackageJson(
        loadedEntryPointPackageJson, entryPointConfig, packagePath, entryPointPath);
  }

  const typings = entryPointPackageJson.typings || entryPointPackageJson.types ||
      guessTypingsFromPackageJson(fs, entryPointPath, entryPointPackageJson);
  if (typeof typings !== 'string') {
    // Missing the required `typings` property
    return INCOMPATIBLE_ENTRY_POINT;
  }

  // An entry-point is assumed to be compiled by Angular if there is either:
  // * a `metadata.json` file next to the typings entry-point
  // * a custom config for this entry-point
  const metadataPath = resolve(entryPointPath, typings.replace(/\.d\.ts$/, '') + '.metadata.json');
  const compiledByAngular = entryPointConfig !== undefined || fs.exists(metadataPath);

  const entryPointInfo: EntryPoint = {
    name: entryPointPackageJson.name,
    path: entryPointPath,
    packagePath,
    packageJson: entryPointPackageJson,
    typings: resolve(entryPointPath, typings),
    compiledByAngular,
    ignoreMissingDependencies:
        entryPointConfig !== undefined ? !!entryPointConfig.ignoreMissingDependencies : false,
    generateDeepReexports:
        entryPointConfig !== undefined ? !!entryPointConfig.generateDeepReexports : false,
  };

  return entryPointInfo;
}

export function isEntryPoint(result: GetEntryPointResult): result is EntryPoint {
  return result !== NO_ENTRY_POINT && result !== INCOMPATIBLE_ENTRY_POINT &&
      result !== IGNORED_ENTRY_POINT;
}

/**
 * Convert a package.json property into an entry-point format.
 *
 * @param property The property to convert to a format.
 * @returns An entry-point format or `undefined` if none match the given property.
 */
export function getEntryPointFormat(
    fs: FileSystem, entryPoint: EntryPoint, property: EntryPointJsonProperty): EntryPointFormat|
    undefined {
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
    case 'browser':
      const browserFile = entryPoint.packageJson['browser'];
      if (typeof browserFile !== 'string') {
        return undefined;
      }
      return sniffModuleFormat(fs, join(entryPoint.path, browserFile));
    case 'main':
      const mainFile = entryPoint.packageJson['main'];
      if (mainFile === undefined) {
        return undefined;
      }
      return sniffModuleFormat(fs, join(entryPoint.path, mainFile));
    case 'module':
      const moduleFilePath = entryPoint.packageJson['module'];
      // As of version 10, the `module` property in `package.json` should point to
      // the ESM2015 format output as per Angular Package format specification. This
      // means that the `module` property captures multiple formats, as old libraries
      // built with the old APF can still be processed. We detect the format by checking
      // the paths that should be used as per APF specification.
      if (typeof moduleFilePath === 'string' && moduleFilePath.includes('esm2015')) {
        return `esm2015`;
      }
      return 'esm5';
    default:
      return undefined;
  }
}

/**
 * Parse the JSON from a `package.json` file.
 * @param packageJsonPath the absolute path to the `package.json` file.
 * @returns JSON from the `package.json` file if it is valid, `null` otherwise.
 */
function loadPackageJson(fs: FileSystem, packageJsonPath: AbsoluteFsPath): EntryPointPackageJson|
    null {
  try {
    return JSON.parse(fs.readFile(packageJsonPath));
  } catch {
    return null;
  }
}

function sniffModuleFormat(fs: FileSystem, sourceFilePath: AbsoluteFsPath): EntryPointFormat|
    undefined {
  const resolvedPath = resolveFileWithPostfixes(fs, sourceFilePath, ['', '.js', '/index.js']);
  if (resolvedPath === null) {
    return undefined;
  }

  const sourceFile =
      ts.createSourceFile(sourceFilePath, fs.readFile(resolvedPath), ts.ScriptTarget.ES5);
  if (sourceFile.statements.length === 0) {
    return undefined;
  }
  if (ts.isExternalModule(sourceFile)) {
    return 'esm5';
  } else if (parseStatementForUmdModule(sourceFile.statements[0]) !== null) {
    return 'umd';
  } else {
    return 'commonjs';
  }
}

function mergeConfigAndPackageJson(
    entryPointPackageJson: EntryPointPackageJson|null, entryPointConfig: NgccEntryPointConfig,
    packagePath: AbsoluteFsPath, entryPointPath: AbsoluteFsPath): EntryPointPackageJson {
  if (entryPointPackageJson !== null) {
    return {...entryPointPackageJson, ...entryPointConfig.override};
  } else {
    const name = `${basename(packagePath)}/${relative(packagePath, entryPointPath)}`;
    return {name, ...entryPointConfig.override};
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

/**
 * Find the version of the package at `packageJsonPath`.
 *
 * The version is read off of the `version` property of the package's `package.json` file (if
 * available).
 *
 * @param packageJson the parsed `package.json` of the package (if available).
 * @returns the version string or `null` if the `pckage.json` file is missing or doesn't contain a
 *     version.
 */
function getPackageVersion(packageJson: EntryPointPackageJson|null): string|null {
  return packageJson?.version ?? null;
}
