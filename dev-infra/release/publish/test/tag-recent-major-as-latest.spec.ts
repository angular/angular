/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {matchesVersion} from '../../../utils/testing';
import {ReleaseTrain} from '../../versioning/release-trains';
import {TagRecentMajorAsLatest} from '../actions/tag-recent-major-as-latest';
import * as externalCommands from '../external-commands';

import {fakeNpmPackageQueryRequest, getTestingMocksForReleaseAction, parse, setupReleaseActionForTesting} from './test-utils';

describe('tag recent major as latest action', () => {
  it('should not be active if a patch has been published after major release', async () => {
    const {releaseConfig} = getTestingMocksForReleaseAction();
    expect(await TagRecentMajorAsLatest.isActive(
               {
                 releaseCandidate: null,
                 next: new ReleaseTrain('master', parse('10.1.0-next.0')),
                 latest: new ReleaseTrain('10.0.x', parse('10.0.1')),
               },
               releaseConfig))
        .toBe(false);
  });

  it('should not be active if a major has been released recently but "@latest" on NPM points to ' +
         'a more recent major',
     async () => {
       const {releaseConfig} = getTestingMocksForReleaseAction();

       // NPM `@latest` will point to a patch release of a more recent major. This is unlikely
       // to happen (only with manual changes outside of the release tool), but should
       // prevent accidental overrides from the release action.
       fakeNpmPackageQueryRequest(
           releaseConfig.npmPackages[0], {'dist-tags': {'latest': '11.0.3'}});

       expect(await TagRecentMajorAsLatest.isActive(
                  {
                    releaseCandidate: null,
                    next: new ReleaseTrain('master', parse('10.1.0-next.0')),
                    latest: new ReleaseTrain('10.0.x', parse('10.0.0')),
                  },
                  releaseConfig))
           .toBe(false);
     });

  it('should not be active if a major has been released recently but "@latest" on NPM points to ' +
         'an older major',
     async () => {
       const {releaseConfig} = getTestingMocksForReleaseAction();

       // NPM `@latest` will point to a patch release of an older major. This is unlikely to happen
       // (only with manual changes outside of the release tool), but should prevent accidental
       // changes from the release action that indicate mismatched version branches, or an
       // out-of-sync NPM registry.
       fakeNpmPackageQueryRequest(releaseConfig.npmPackages[0], {'dist-tags': {'latest': '8.4.7'}});

       expect(await TagRecentMajorAsLatest.isActive(
                  {
                    releaseCandidate: null,
                    next: new ReleaseTrain('master', parse('10.1.0-next.0')),
                    latest: new ReleaseTrain('10.0.x', parse('10.0.0')),
                  },
                  releaseConfig))
           .toBe(false);
     });


  it('should be active if a major has been released recently but is not published as ' +
         '"@latest" to NPM',
     async () => {
       const {releaseConfig} = getTestingMocksForReleaseAction();

       // NPM `@latest` will point to a patch release of the previous major.
       fakeNpmPackageQueryRequest(releaseConfig.npmPackages[0], {'dist-tags': {'latest': '9.2.3'}});

       expect(await TagRecentMajorAsLatest.isActive(
                  {
                    releaseCandidate: null,
                    next: new ReleaseTrain('master', parse('10.1.0-next.0')),
                    latest: new ReleaseTrain('10.0.x', parse('10.0.0')),
                  },
                  releaseConfig))
           .toBe(true);
     });

  it('should be active if a major has been released recently but is not published as ' +
         '"@latest" to NPM',
     async () => {
       const {instance, gitClient, releaseConfig} =
           setupReleaseActionForTesting(TagRecentMajorAsLatest, {
             releaseCandidate: null,
             next: new ReleaseTrain('master', parse('10.1.0-next.0')),
             latest: new ReleaseTrain('10.0.x', parse('10.0.0')),
           });

       // NPM `@latest` will point to a patch release of the previous major.
       fakeNpmPackageQueryRequest(releaseConfig.npmPackages[0], {'dist-tags': {'latest': '9.2.3'}});

       await instance.perform();

       // Ensure that the NPM dist tag is set only for packages that were available in the previous
       // major version. A spy has already been installed on the function.
       (externalCommands.invokeSetNpmDistCommand as jasmine.Spy).and.callFake(() => {
         expect(gitClient.head.ref?.name).toBe('10.0.x');
         return Promise.resolve();
       });

       expect(externalCommands.invokeSetNpmDistCommand).toHaveBeenCalledTimes(1);
       expect(externalCommands.invokeSetNpmDistCommand)
           .toHaveBeenCalledWith('latest', matchesVersion('10.0.0'));
     });
});
