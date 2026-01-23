import {getInput, setFailed} from '@actions/core';
import {context} from '@actions/github';
import {deployToFirebase, setupRedirect} from './deploy.mjs';
import {getDeployments} from './deployments.mjs';
import {generateSitemap} from './sitemap.mjs';
import {assertValidGithubConfig, AuthenticatedGitClient, getConfig} from '@angular/ng-dev';
import {githubReleaseTrainReadToken} from './credential.mjs';
import {spawnSync} from 'child_process';
import {cp, mkdtemp} from 'fs/promises';
import {tmpdir} from 'os';
import {join} from 'path';

const refMatcher = /refs\/heads\/(.*)/;

async function deployDocs() {
  getConfig([assertValidGithubConfig]);

  AuthenticatedGitClient.configure(githubReleaseTrainReadToken);

  if (context.eventName !== 'push') {
    throw Error();
  }
  const matchedRef = context.ref.match(refMatcher);
  if (matchedRef === null) {
    throw Error();
  }

  const currentBranch = matchedRef[1];
  const configPath = getInput('configPath');
  const stagingDir = await mkdtemp(join(tmpdir(), 'deploy-directory'));

  // Copy all files from the distDir into stagingDir and modify the permissions for editing
  await cp(getInput('distDir'), stagingDir, {recursive: true});
  spawnSync(`chmod 777 -R ${stagingDir}`, {encoding: 'utf-8', shell: true});

  const deployment = (await getDeployments()).get(currentBranch);
  if (deployment === undefined) {
    console.log(`Current branch (${currentBranch}) does not deploy a documentation site.`);
    console.log(`Exiting...`);
    process.exit(0);
  }

  console.log('Doc site deployment information');
  console.log('');
  console.log('Current Branch:');
  console.log(`  ${deployment.branch}`);
  console.log('');
  console.log('Firebase Site:');
  if (deployment.destination === undefined) {
    console.log('  No deployment of a documenation site is necessary');
  } else {
    console.log(`  Deploying to: ${deployment.destination}`);
  }
  console.log('');
  console.log('Redirect Configuration:');
  if (deployment.redirect === undefined) {
    console.log('  No redirects are necessary');
  } else {
    console.log(`  From: ${deployment.redirect.from}`);
    console.log(`  To: ${deployment.redirect.to}`);
  }

  await generateSitemap(deployment, stagingDir);
  await deployToFirebase(deployment, configPath, stagingDir);
  await setupRedirect(deployment);
}

// Only run if the action is executed in a repository with is in the Angular org. This is in place
// to prevent the action from actually running in a fork of a repository with this action set up.
if (context.repo.owner === 'angular') {
  deployDocs().catch((e: Error) => {
    setFailed(e.message);
    console.error(e);
  });
} else {
  console.warn(
    'The action was skipped as this action is only meant to run in repos belonging to the Angular organization.',
  );
}
