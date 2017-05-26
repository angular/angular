import {writeFileSync} from 'fs';
import {join} from 'path';
import {MATERIAL_VERSION} from '../build-config';

/** Updates the `package.json` file of the specified package. Replaces the version placeholder. */
export function updatePackageVersion(packageDir: string) {
  const packagePath = join(packageDir, 'package.json');
  const packageConfig = require(packagePath);

  // Replace the `0.0.0-PLACEHOLDER` version name with the version of the root package.json file.
  packageConfig.version = packageConfig.version.replace('0.0.0-PLACEHOLDER', MATERIAL_VERSION);

  writeFileSync(packagePath, JSON.stringify(packageConfig, null, 2));
}
