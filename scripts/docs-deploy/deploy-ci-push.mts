#!/usr/bin/env node

import {
  ActiveReleaseTrains,
  getBranchesForMajorVersions,
  getVersionForVersionBranch,
  isVersionBranch,
} from '@angular/dev-infra-private/ng-dev';
import {firebaseConfig, sites} from './utils.mjs';

import {buildAndDeployWithSnapshots} from './snapshot-deploy.mjs';
import {getReleaseRepoWithApi} from './github-versioning.mjs';
import {updateVersionsFile} from './update-versions-file.mjs';

async function main() {
  if (process.env.CIRCLE_PR_NUMBER !== undefined) {
    console.log('Skipping deployment for pull request build.');
    return;
  }

  const branchName = process.env.CIRCLE_BRANCH;
  if (branchName === undefined) {
    throw new Error('Deployment script is unable to determine CI branch.');
  }

  const repo = await getReleaseRepoWithApi();
  const active = await ActiveReleaseTrains.fetch(repo);
  const description = `${branchName} - ${process.env.CIRCLE_SHA1!}`;
  const {projectId, serviceKey} = firebaseConfig;

  if (branchName === active.next.branchName) {
    const major = active.next.version.major;
    const targets = [{projectId, description, site: sites.next}];

    // If the next release train is for a new major that is not published as part of the
    // other active release trains, we also publish to e.g. `v14.material.angular.io`.
    // Note: If both `rc` and `next` have the same major, we want the `rc` release-train
    // to take precedence and be responsible for the `<major>.material.angular.io` deploy.
    if (major > (active.releaseCandidate ?? active.latest).version.major) {
      targets.push({projectId, description, site: sites.forMajor(major)});
    }

    await buildAndDeployWithSnapshots(serviceKey, major, targets);
    return;
  }

  if (branchName === active.latest.branchName) {
    const major = active.latest.version.major;
    const targets = [
      {projectId, description, site: sites.stable},
      {projectId, description, site: sites.forMajor(major)},
    ];

    // If there is no active RC train, we also push the current stable to the `rc` site.
    // TODO: This can be improved by using redirects from rc -> stable.
    if (active.releaseCandidate === null) {
      targets.push({projectId, description, site: sites.rc});
    }

    await buildAndDeployWithSnapshots(serviceKey, major, targets, {
      // For the stable deployment, we want to update the versions file which is loaded
      // by all docs sites (archives, rc, next etc.). The source of truth for all versions
      // shown in the "docs version picker" is the versions file deployed in stable.
      prebuild: docsRepoDir => updateVersionsFile(docsRepoDir, active),
    });
    return;
  }

  if (branchName === active.releaseCandidate?.branchName) {
    const major = active.releaseCandidate.version.major;
    const targets = [{projectId, description, site: sites.rc}];

    // If the RC is for a new major that `latest` does not publish yet, we will deploy
    // the dedicated major site like `v13.material.angular.io` using the `rc` branch.
    // Note: If both `rc` and `next` have the same major, we want the `rc` release-train
    // to take precedence and be responsible for the `<major>.material.angular.io` deploy.
    if (major > active.latest.version.major) {
      targets.push({projectId, description, site: sites.forMajor(major)});
    }

    await buildAndDeployWithSnapshots(serviceKey, major, targets);
    return;
  }

  // In other cases, we are potentially deploying an archived major, regardless
  // of LTS being active or not.
  if (!isVersionBranch(branchName)) {
    console.log('Skipping deployment as the current branch is not a version branch.');
    return;
  }

  const branchVersion = getVersionForVersionBranch(branchName)!;
  const branchMajor = branchVersion.major;
  const branchesForMajor = await getBranchesForMajorVersions(repo, [branchMajor]);

  // The `branchesForMajor` array will hold the most recent version branch for current major.
  // If the latest branch does not match the current one, we know that this is not the
  // most recent minor and should not be re-deployed to e.g. `<major>.material.angular.io`.
  if (branchesForMajor[0].name !== branchName) {
    console.log(
      `Skipping deployment as version branch is not the most recent ` +
        `one for v${branchMajor}. Expected: ${branchesForMajor[0].name}`,
    );
    return;
  }

  await buildAndDeployWithSnapshots(serviceKey, branchMajor, [
    {projectId, description, site: sites.forMajor(branchMajor)},
  ]);
}

try {
  await main();
} catch (e) {
  console.error(e);
  process.exitCode = 1;
}
