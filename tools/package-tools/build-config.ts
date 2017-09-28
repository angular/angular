import {findBuildConfig} from './find-build-config';

export interface BuildConfig {
  /** Current version of the project. */
  projectVersion: string;
  /** Required Angular version for the project. */
  angularVersion: string;
  /** Path to the root of the project. */
  projectDir: string;
  /** Path to the directory where all packages are living. */
  packagesDir: string;
  /** Path to the directory where the output will be stored. */
  outputDir: string;
  /** License banner that will be placed inside of every bundle. */
  licenseBanner: string;
}

// Search for a build config by walking up the current working directory of the Node process.
const buildConfigPath = findBuildConfig();

if (!buildConfigPath) {
  throw 'Material2 Build tools were not able to find a build config. ' +
  'Please create a "build-config.js" file in your project.';
}

// Load the config file using a basic CommonJS import.
export const buildConfig = require(buildConfigPath) as BuildConfig;
