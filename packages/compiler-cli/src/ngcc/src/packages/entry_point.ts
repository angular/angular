/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'canonical-path';
import * as fs from 'fs';


/**
 * The possible values for the format of an entry-point.
 */
export type EntryPointFormat = 'esm5' | 'fesm5' | 'esm2015' | 'fesm2015' | 'umd';

/**
 * An object containing paths to the entry-points for each format.
 */
export type EntryPointPaths = {
  [Format in EntryPointFormat]?: string;
};

/**
 * An object containing information about an entry-point, including paths
 * to each of the possible entry-point formats.
 */
export type EntryPoint = EntryPointPaths & {
  /** The name of the package (e.g. `@angular/core`). */
  name: string;
  /** The path to the package that contains this entry-point. */
  package: string;
  /** The path to this entry point. */
  path: string;
  /** The path to a typings (.d.ts) file for this entry-point. */
  typings: string;
};

interface EntryPointPackageJson {
  name: string;
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
 * Parses the JSON from a package.json file.
 * @param packageJsonPath the absolute path to the package.json file.
 * @returns JSON from the package.json file if it is valid, `null` otherwise.
 */
function loadEntryPointPackage(packageJsonPath: string): {[key: string]: any}|null {
  try {
    return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  } catch (e) {
    // We may have run into a package.json with unexpected symbols
    console.warn(`Failed to read entry point info from ${packageJsonPath} with error ${e}.`);
    return null;
  }
}

/**
 * Try to get entry point info from the given path.
 * @param pkgPath the absolute path to the containing npm package
 * @param entryPoint the absolute path to the potential entry point.
 * @returns Info about the entry point if it is valid, `null` otherwise.
 */
export function getEntryPointInfo(pkgPath: string, entryPoint: string): EntryPoint|null {
  const packageJsonPath = path.resolve(entryPoint, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    return null;
  }

  const entryPointPackageJson = loadEntryPointPackage(packageJsonPath);
  if (!entryPointPackageJson) {
    return null;
  }

  // If there is `esm2015` then `es2015` will be FESM2015, otherwise ESM2015.
  // If there is `esm5` then `module` will be FESM5, otherwise it will be ESM5.
  const {
    name,
    module: modulePath,
    types,
    typings = types,  // synonymous
    es2015,
    fesm2015 = es2015,   // synonymous
    fesm5 = modulePath,  // synonymous
    esm2015,
    esm5,
    main
  } = entryPointPackageJson;
  // Minimum requirement is that we have typings and one of esm2015 or fesm2015 formats.
  if (!typings || !(fesm2015 || esm2015)) {
    return null;
  }

  // Also we need to have a metadata.json file
  const metadataPath = path.resolve(entryPoint, typings.replace(/\.d\.ts$/, '') + '.metadata.json');
  if (!fs.existsSync(metadataPath)) {
    return null;
  }

  const entryPointInfo: EntryPoint = {
    name,
    package: pkgPath,
    path: entryPoint,
    typings: path.resolve(entryPoint, typings),
  };

  if (esm2015) {
    entryPointInfo.esm2015 = path.resolve(entryPoint, esm2015);
  }
  if (fesm2015) {
    entryPointInfo.fesm2015 = path.resolve(entryPoint, fesm2015);
  }
  if (fesm5) {
    entryPointInfo.fesm5 = path.resolve(entryPoint, fesm5);
  }
  if (esm5) {
    entryPointInfo.esm5 = path.resolve(entryPoint, esm5);
  }
  if (main) {
    entryPointInfo.umd = path.resolve(entryPoint, main);
  }

  return entryPointInfo;
}
