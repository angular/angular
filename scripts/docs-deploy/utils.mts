import * as fs from 'fs';
import * as path from 'path';
import {fileURLToPath} from 'url';

import {InstallOptions, installDepsForDocsSite} from './docs-deps-install.mjs';

import {$} from 'zx';

/** Absolute path to the `angular/components` project root. */
export const projectDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** Interface describing a site target for the docs-app. */
export class SiteTarget {
  constructor(public firebaseSiteId: string, public remoteUrl: string) {}
}

/** Object capturing all site targets for the docs-app. */
export const sites = {
  stable: new SiteTarget('latest-material-angular-io', 'https://material.angular.io'),
  next: new SiteTarget('next-material-angular-io', 'https://next.material.angular.io'),
  rc: new SiteTarget('rc-material-angular-io', 'https://rc.material.angular.io'),

  forMajor: (major: number) =>
    new SiteTarget(`v${major}-material-angular-io`, `https://v${major}.material.angular.io`),
};

/** Optional Github access token. Can be used for querying the active release trains. */
export const githubAccessToken: string | undefined = process.env.DOCS_DEPLOY_GITHUB_TOKEN;

/** Configuration describing the Firebase project that we deploy to. */
export const firebaseConfig = {
  projectId: 'material-angular-io',
  serviceKey: process.env.DOCS_SITE_GCP_SERVICE_KEY!,
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
