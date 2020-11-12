import {join} from 'path';
import {exec} from 'shelljs';
import {ReleaseConfig} from '../dev-infra/release/config';


const packages = [
  'animations',
  'bazel',
  'common',
  'compiler',
  'compiler-cli',
  'core',
  'elements',
  'forms',
  'language-service',
  'localize',
  'platform-browser',
  'platform-browser-dynamic',
  'platform-server',
  'router',
  'service-worker',
  'upgrade',
];

/** Configuration for the `ng-dev release` command. */
export const release: ReleaseConfig = {
  npmPackages: packages.map(pkg => `@angular/${pkg}`),
  buildPackages: async () => {
    const packageTargets = packages.map(pkg => `//packages/${pkg}:npm_package`).join(' ');
    const buildResult = exec(`yarn -s bazel build --stamp ${packageTargets}`);

    if (buildResult.code !== 0) {
      throw new Error(`Error occured while building packages:\n${buildResult.stderr}`);
    }

    return packages.map(pkg => ({
                          name: `@angular/${pkg}`,
                          outputPath: `dist/bin/packages/${pkg}/npm_package`,
                        }))
  },
  // TODO: This can be removed once there is an org-wide tool for changelog generation.
  generateReleaseNotesForHead: async () => {
    exec('yarn -s gulp changelog', {cwd: join(__dirname, '../')});
  },
};
