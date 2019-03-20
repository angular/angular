/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'canonical-path';
import * as fs from 'fs';
import {isDefined} from '../utils';


/**
 * An object containing paths to the entry-points for each format.
 */
export interface EntryPointPaths {
  esm5?: string;
  fesm5?: string;
  esm2015?: string;
  fesm2015?: string;
  umd?: string;
}

/**
 * The possible values for the format of an entry-point.
 */
export type EntryPointFormat = keyof(EntryPointPaths);

/**
 * An object containing information about an entry-point, including paths
 * to each of the possible entry-point formats.
 */
export interface EntryPoint extends EntryPointPaths {
  /** The name of the package (e.g. `@angular/core`). */
  name: string;
  /** The parsed package.json file for this entry-point. */
  packageJson: EntryPointPackageJson;
  /** The path to the package that contains this entry-point. */
  package: string;
  /** The path to this entry point. */
  path: string;
  /** The path to a typings (.d.ts) file for this entry-point. */
  typings: string;
}

interface PackageJsonFormatProperties {
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
  __modified_by_ngcc__?: {[key: string]: string};
}

export type EntryPointJsonProperty = keyof(PackageJsonFormatProperties);

/**
 * Try to create an entry-point from the given paths and properties.
 *
 * @param packagePath the absolute path to the containing npm package
 * @param entryPointPath the absolute path to the potential entry-point.
 * @returns An entry-point if it is valid, `null` otherwise.
 */
export function getEntryPointInfo(packagePath: string, entryPointPath: string): EntryPoint|null {
  const packageJsonPath = path.resolve(entryPointPath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    return null;
  }

  const entryPointPackageJson = loadEntryPointPackage(packageJsonPath);
  if (!entryPointPackageJson) {
    return null;
  }


  // We must have a typings property
  const typings = entryPointPackageJson.typings || entryPointPackageJson.types;
  if (!typings) {
    return null;
  }

  // Also there must exist a `metadata.json` file next to the typings entry-point.
  const metadataPath =
      path.resolve(entryPointPath, typings.replace(/\.d\.ts$/, '') + '.metadata.json');
  if (!fs.existsSync(metadataPath)) {
    return null;
  }

  const formats = Object.keys(entryPointPackageJson)
                      .map((property: EntryPointJsonProperty) => {
                        const format = getEntryPointFormat(entryPointPackageJson, property);
                        return format ? {property, format} : undefined;
                      })
                      .filter(isDefined);

  const entryPointInfo: EntryPoint = {
    name: entryPointPackageJson.name,
    packageJson: entryPointPackageJson,
    package: packagePath,
    path: entryPointPath,
    typings: path.resolve(entryPointPath, typings)
  };

  // Add the formats to the entry-point info object.
  formats.forEach(
      item => entryPointInfo[item.format] =
          path.resolve(entryPointPath, entryPointPackageJson[item.property] !));

  return entryPointInfo;
}

/**
 * Convert a package.json property into an entry-point format.
 *
 * The actual format is dependent not only on the property itself but also
 * on what other properties exist in the package.json.
 *
 * @param entryPointProperties The package.json that contains the properties.
 * @param property The property to convert to a format.
 * @returns An entry-point format or `undefined` if none match the given property.
 */
export function getEntryPointFormat(
    entryPointProperties: EntryPointPackageJson, property: string): EntryPointFormat|undefined {
  switch (property) {
    case 'fesm2015':
      return 'fesm2015';
    case 'fesm5':
      return 'fesm5';
    case 'es2015':
      return !entryPointProperties.fesm2015 ? 'fesm2015' : 'esm2015';
    case 'esm2015':
      return 'esm2015';
    case 'esm5':
      return 'esm5';
    case 'main':
      return 'umd';
    case 'module':
      return !entryPointProperties.fesm5 ? 'fesm5' : 'esm5';
    default:
      return undefined;
  }
}

/**
 * Parses the JSON from a package.json file.
 * @param packageJsonPath the absolute path to the package.json file.
 * @returns JSON from the package.json file if it is valid, `null` otherwise.
 */
function loadEntryPointPackage(packageJsonPath: string): EntryPointPackageJson|null {
  try {
    return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  } catch (e) {
    // We may have run into a package.json with unexpected symbols
    console.warn(`Failed to read entry point info from ${packageJsonPath} with error ${e}.`);
    return null;
  }
}
