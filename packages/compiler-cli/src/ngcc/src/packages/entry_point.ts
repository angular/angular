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
  esm2015?: string;
  esm5?: string;
  main?: string;
  types?: string;
  typings?: string;
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

  // According to https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html,
  // `types` and `typings` are interchangeable.
  const {name, fesm2015, fesm5, esm2015, esm5, main, types, typings = types}:
      EntryPointPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Minimum requirement is that we have esm2015 format and typings.
  if (!typings || !esm2015) {
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
    esm2015: path.resolve(entryPoint, esm2015),
  };

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
