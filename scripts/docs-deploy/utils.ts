import * as fs from 'fs';
import * as path from 'path';

import {InstallOptions, installDepsForDocsSite} from './docs-deps-install';

import {$} from 'zx';

/** Absolute path to the `angular/components` project root. */
export const projectDir = path.join(__dirname, '../..');

/** Interface describing a site target for the docs-app. */
export class SiteTarget {
  constructor(public firebaseSiteId: string, public remoteUrl: string) {}
}

/** Object capturing all site targets for the docs-app. */
export const sites = {
  stable: new SiteTarget('ng-comp-test', 'https://ng-comp-test.firebaseapp.com'),
  next: new SiteTarget('next-ng-comp-test', 'https://next-ng-comp-test.firebaseapp.com'),
  rc: new SiteTarget('rc-ng-comp-test', 'https://rc-ng-comp-test.firebaseapp.com'),

  forMajor: (major: number) =>
    new SiteTarget(`v${major}-ng-comp-test`, `https://v${major}-ng-comp-test.firebaseapp.com`),
};

/** Configuration describing the Firebase project that we deploy to. */
export const firebaseConfig = {
  projectId: 'angular-components-test',
  serviceKey: process.env.DOCS_SITE_FIREBASE_SERVICE_KEY!,
};

/** Finds and parsed the `package.json` of the specified project directory. */
export async function getPackageJsonOfProject(
  projectPath: string,
): Promise<{path: string; parsed: any}> {
  const packageJsonPath = path.join(projectPath, 'package.json');
  const packageJsonContent = await fs.promises.readFile(packageJsonPath, 'utf8');

  return {
    path: packageJsonPath,
    parsed: JSON.parse(packageJsonContent),
  };
}

/**
 * Installs dependencies in the specified docs repository and builds the
 * production site output.
 */
export async function installDepsAndBuildDocsSite(repoPath: string, options: InstallOptions) {
  await installDepsForDocsSite(repoPath, options);
  await $`yarn --cwd ${repoPath} prod-build`;
}
