/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createPatch} from 'diff';
import * as fs from 'fs';
import * as path from 'path';

import {publicApi, SerializationOptions} from './serializer';

export {publicApi, SerializationOptions} from './serializer';

export function generateGoldenFile(
    entrypoint: string, outFile: string, options: SerializationOptions = {}): void {
  const output = publicApi(entrypoint, options);

  ensureDirectory(path.dirname(outFile));
  fs.writeFileSync(outFile, output);
}

export function verifyAgainstGoldenFile(
    entrypoint: string, goldenFile: string, options: SerializationOptions = {}): string {
  const actual = publicApi(entrypoint, options);
  const expected = fs.existsSync(goldenFile) ? fs.readFileSync(goldenFile).toString() : '';

  if (actual === expected) {
    return '';
  } else {
    // The patch should not show absolute paths, as these are pretty long and obfuscated
    // the printed golden diff. Additionally, path separators in the patch should be forward
    // slashes for consistency and to enable easier integration testing.
    const displayFileName = path.relative(process.cwd(), goldenFile).replace(/\\/g, '/');
    const patch = createPatch(displayFileName, expected, actual, 'Golden file', 'Generated API');

    // Remove the header of the patch
    const start = patch.indexOf('\n', patch.indexOf('\n') + 1) + 1;

    return patch.substring(start);
  }
}

function ensureDirectory(dir: string) {
  if (!fs.existsSync(dir)) {
    ensureDirectory(path.dirname(dir));
    fs.mkdirSync(dir);
  }
}

/**
 * Determine if the provided path is a directory.
 */
function isDirectory(dirPath: string) {
  try {
    return fs.lstatSync(dirPath).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Gets an array of paths to the typings files for each of the recursively discovered
 * package.json
 * files from the directory provided.
 */
export function discoverAllEntrypoints(dirPath: string) {
  // Determine all of the package.json files
  const packageJsons: string[] = [];
  const entryPoints: string[] = [];
  const findPackageJsonsInDir = (nextPath: string) => {
    for (const file of fs.readdirSync(nextPath)) {
      const fullPath = path.join(nextPath, file);
      if (isDirectory(fullPath)) {
        findPackageJsonsInDir(fullPath);
      } else {
        if (file === 'package.json') {
          packageJsons.push(fullPath);
        }
      }
    }
  };
  findPackageJsonsInDir(dirPath);

  // Get all typings file locations from package.json files
  for (const packageJson of packageJsons) {
    const packageJsonObj =
        JSON.parse(fs.readFileSync(packageJson, {encoding: 'utf8'})) as {typings: string};
    const typings = packageJsonObj.typings;
    if (typings) {
      entryPoints.push(path.join(path.dirname(packageJson), typings));
    }
  }

  return entryPoints;
}
