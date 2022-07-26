import * as fs from 'fs';
import * as url from 'url';

import {BuiltPackage} from '@angular/ng-dev';
import {getPackageJsonOfProject} from './utils.mjs';

export async function installBuiltPackagesInRepo(repoPath: string, builtPackages: BuiltPackage[]) {
  const {parsed: packageJson, path: packageJsonPath} = await getPackageJsonOfProject(repoPath);

  for (const builtPackage of builtPackages) {
    const pkgName = builtPackage.name;
    const destinationUrl = url.pathToFileURL(builtPackage.outputPath);

    // Override the dependencies to point to the local files instead of the version on npm.
    // Note that we don't want to change the `resolutions` to point to the same files, because it
    // can cause duplicated dependencies (see #24992).
    packageJson.dependencies[pkgName] = destinationUrl;

    // In case this dependency was previously a dev dependency, just remove it because we
    // re-added it as a normal dependency for simplicity.
    delete packageJson.devDependencies[pkgName];
  }

  await fs.promises.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
}
