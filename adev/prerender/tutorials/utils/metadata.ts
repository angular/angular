/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {basename, dirname} from 'path';
import {PackageJson} from '../tutorials-types';
import {shouldUseFileInWebContainer} from './webcontainers';

export function validatePackageJson(
  files: string[],
  projectPackageJson: PackageJson,
  commonPackageJson: PackageJson,
): void {
  if (!files.some((file) => basename(file) === 'package-lock.json')) {
    throw new Error(
      `Tutorial at ${dirname(
        files[0],
      )} has a package.json but is missing a package-lock.json. A lock file is required for faster installs.`,
    );
  }

  const commonDependencies = {
    ...commonPackageJson.dependencies,
    ...commonPackageJson.devDependencies,
  };

  const projectDependencies = {
    ...projectPackageJson.dependencies,
    ...projectPackageJson.devDependencies,
  };

  const projectDependenciesNames = Object.keys(projectDependencies);

  for (const dependency of Object.keys(commonDependencies)) {
    if (!projectDependenciesNames.includes(dependency)) {
      throw new Error(
        `Tutorial at ${dirname(files[0])} is missing '${dependency}' as a dependency.`,
      );
    } else {
      const commonDependencyVersion = commonDependencies[dependency];
      const projectDependencyVersion = projectDependencies[dependency];

      if (commonDependencyVersion !== projectDependencyVersion) {
        throw new Error(
          `${dirname(
            files[0],
          )} has a different version of '${dependency}' than the common package.json.
            The common version is ${commonDependencyVersion}.
            The project version is ${projectDependencyVersion}.
            
            Please update the project package.json to match the common package.json, or update both.`,
        );
      }
    }
  }
}

export function getAllFiles(
  projectFiles: string[],
  commonFiles: string[],
  getCleanFilePath: (file: string) => string,
) {
  const commonAndProjectPaths = [...commonFiles, ...projectFiles]
    .map((file) => getCleanFilePath(file))
    .filter(shouldUseFileInWebContainer);

  const uniquePaths = Array.from(new Set(commonAndProjectPaths));

  return uniquePaths;
}
