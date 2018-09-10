import {red} from 'chalk';
import {spawnSync} from 'child_process';
import {task} from 'gulp';
import {buildConfig} from 'material2-build-tools';
import * as minimist from 'minimist';
import {checkPublishBranch, versionNameRegex} from './branch-check';

const {projectDir, projectVersion} = buildConfig;

/** Git repository URL that has been read out from the project package.json file. */
const repositoryGitUrl = require('../../../../package.json').repository.url;

/** Parse command-line arguments for release task. */
const argv = minimist(process.argv.slice(3));

/** Task that runs various sanity checks before publishing. */
task(':publish:sanity-checks', [
  ':publish:check-project-version',
  ':publish:check-remote-tag',
  ':publish:check-publish-branch',
]);

/** Task that checks the new project version. */
task(':publish:check-project-version', () => {
  const tag = argv['tag'];

  if (!projectVersion.match(versionNameRegex)) {
    console.error(red(`Error: Cannot publish due to an invalid version name. Version ` +
        `"${projectVersion}" is not following our semver format.`));
    console.error(red(`A version should follow this format: X.X.X, X.X.X-beta.X, ` +
        `X.X.X-alpha.X, X.X.X-rc.X`));
    process.exit(1);
  }

  if (projectVersion.match(/(alpha|beta|rc)/) && (!tag || tag === 'latest')) {
    console.error(red(`Publishing ${projectVersion} to the "latest" tag is not allowed.`));
    console.error(red(`Alpha, Beta or RC versions shouldn't be published to "latest".`));
    process.exit(1);
  }
});

/** Task that verifies that the new version can be published from the current branch. */
task(':publish:check-publish-branch', () => checkPublishBranch(projectVersion));

/** Task that ensures that the new release tagged on GitHub before publishing to NPM. */
task(':publish:check-remote-tag', () => {
  // Since we cannot assume that every developer uses `origin` as the default name for the upstream
  // remote, we just pass in the Git URL that refers to angular/material2 repository on Github.
  const tagCommitSha = spawnSync('git', ['ls-remote', '--tags', repositoryGitUrl, projectVersion],
      {cwd: projectDir}).stdout.toString().trim();

  if (!tagCommitSha) {
    console.error(red(`Cannot publish v${projectVersion} because the release is not ` +
        `tagged on upstream yet. Please tag the release before publishing to NPM.`));
    process.exit(1);
  }
});
