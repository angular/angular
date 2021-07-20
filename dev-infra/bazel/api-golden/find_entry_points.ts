/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {lstatSync, readdirSync, readFileSync} from 'fs';
import {dirname, join} from 'path';

/** Interface describing a resolved NPM package entry point. */
export interface PackageEntryPoint {
  typesEntryPointPath: string;
  packageJsonPath: string;
}

/** Interface describing contents of a `package.json`. */
interface PackageJson {
  types?: string;
  typings?: string;
}

/** Finds all entry points within a given NPM package directory. */
export function findEntryPointsWithinNpmPackage(dirPath: string): PackageEntryPoint[] {
  const entryPoints: PackageEntryPoint[] = [];

  for (const packageJsonFilePath of findPackageJsonFilesInDirectory(dirPath)) {
    const packageJson = JSON.parse(readFileSync(packageJsonFilePath, 'utf8')) as PackageJson;
    const typesFile = packageJson.types || packageJson.typings;

    if (typesFile) {
      entryPoints.push({
        packageJsonPath: packageJsonFilePath,
        typesEntryPointPath: join(dirname(packageJsonFilePath), typesFile),
      });
    }
  }

  return entryPoints;
}

/** Determine if the provided path is a directory. */
function isDirectory(dirPath: string) {
  try {
    return lstatSync(dirPath).isDirectory();
  } catch {
    return false;
  }
}

/** Finds all `package.json` files within a directory. */
function* findPackageJsonFilesInDirectory(directoryPath: string): IterableIterator<string> {
  for (const fileName of readdirSync(directoryPath)) {
    const fullPath = join(directoryPath, fileName);
    if (isDirectory(fullPath)) {
      yield* findPackageJsonFilesInDirectory(fullPath);
    } else if (fileName === 'package.json') {
      yield fullPath;
    }
  }
}
