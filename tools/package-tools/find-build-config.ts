import {resolve, dirname, join} from 'path';
import {existsSync} from 'fs';

/** Name of the build config file. */
const BUILD_CONFIG_FILENAME = 'build-config.js';

/** Method that searches for a build config file that will be used for packaging. */
export function findBuildConfig(): string | null {
  let currentDir = process.cwd();

  while (!existsSync(resolve(currentDir, BUILD_CONFIG_FILENAME))) {
    let parentDir = dirname(currentDir);

    if (parentDir === currentDir) {
      return null;
    }

    currentDir = parentDir;
  }

  return join(currentDir, BUILD_CONFIG_FILENAME);
}
