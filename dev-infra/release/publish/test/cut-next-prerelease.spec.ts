/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {readFileSync} from 'fs';
import {join} from 'path';

import {ReleaseTrain} from '../../versioning/release-trains';
import {CutNextPrereleaseAction} from '../actions/cut-next-prerelease';
import {packageJsonPath} from '../constants';

import {expectStagingAndPublishWithCherryPick, expectStagingAndPublishWithoutCherryPick, parse, setupReleaseActionForTesting} from './test-utils';

describe('cut next pre-release action', () => {
  it('should always be active regardless of release-trains', async () => {
    expect(await CutNextPrereleaseAction.isActive()).toBe(true);
  });

  it('should cut a pre-release for the next branch if there is no FF/RC branch', async () => {
    const action = setupReleaseActionForTesting(CutNextPrereleaseAction, {
      releaseCandidate: null,
      next: new ReleaseTrain('master', parse('10.2.0-next.0')),
      latest: new ReleaseTrain('10.1.x', parse('10.1.2')),
    });

    await expectStagingAndPublishWithoutCherryPick(action, 'master', '10.2.0-next.1', 'next');
  });

  // This is test for a special case in the release tooling. Whenever we branch off for
  // feature-freeze, we immediately bump the version in the `next` branch but do not publish
  // it. This is because there are no new changes in the next branch that wouldn't be part of
  // the branched-off feature-freeze release-train. Also while a FF/RC is active, we cannot
  // publish versions to the NPM dist tag. This means that the version is later published, but
  // still needs all the staging work (e.g. changelog). We special-case this by not incrementing
  // the version if the version in the next branch has not been published yet.
  it('should not bump version if current next version has not been published', async () => {
    const action = setupReleaseActionForTesting(
        CutNextPrereleaseAction, {
          releaseCandidate: null,
          next: new ReleaseTrain('master', parse('10.2.0-next.0')),
          latest: new ReleaseTrain('10.1.x', parse('10.1.0')),
        },
        /* isNextPublishedToNpm */ false);

    await expectStagingAndPublishWithoutCherryPick(action, 'master', '10.2.0-next.0', 'next');

    const pkgJsonContents = readFileSync(join(action.testTmpDir, packageJsonPath), 'utf8');
    const pkgJson = JSON.parse(pkgJsonContents) as {version: string, [key: string]: any};
    expect(pkgJson.version).toBe('10.2.0-next.0', 'Expected version to not have changed.');
  });

  describe('with active feature-freeze', () => {
    it('should create a proper new version and select correct branch', async () => {
      const action = setupReleaseActionForTesting(CutNextPrereleaseAction, {
        releaseCandidate: new ReleaseTrain('10.1.x', parse('10.1.0-next.4')),
        next: new ReleaseTrain('master', parse('10.2.0-next.0')),
        latest: new ReleaseTrain('10.0.x', parse('10.0.2')),
      });

      await expectStagingAndPublishWithCherryPick(action, '10.1.x', '10.1.0-next.5', 'next');
    });
  });

  describe('with active release-candidate', () => {
    it('should create a proper new version and select correct branch', async () => {
      const action = setupReleaseActionForTesting(CutNextPrereleaseAction, {
        releaseCandidate: new ReleaseTrain('10.1.x', parse('10.1.0-rc.0')),
        next: new ReleaseTrain('master', parse('10.2.0-next.0')),
        latest: new ReleaseTrain('10.0.x', parse('10.0.2')),
      });

      await expectStagingAndPublishWithCherryPick(action, '10.1.x', '10.1.0-rc.1', 'next');
    });
  });
});
