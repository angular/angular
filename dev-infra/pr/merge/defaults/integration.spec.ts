/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as nock from 'nock';
import {ParsedUrlQuery} from 'querystring';

import {ReleaseConfig} from '../../../release/config/index';
import {_npmPackageInfoCache, NpmPackageInfo} from '../../../release/versioning/npm-registry';
import {GithubConfig} from '../../../utils/config';
import * as console from '../../../utils/console';
import {GithubClient} from '../../../utils/git/github';
import {buildGithubPaginationResponseHeader} from '../../../utils/testing/github-pagination-header';
import {TargetLabel} from '../config';
import {getBranchesFromTargetLabel, getTargetLabelFromPullRequest} from '../target-label';

import {getDefaultTargetLabelConfiguration} from './index';

const API_ENDPOINT = `https://api.github.com`;

describe('default target labels', () => {
  let api: GithubClient;
  let githubConfig: GithubConfig;
  let releaseConfig: ReleaseConfig;

  beforeEach(() => {
    api = new GithubClient();
    githubConfig = {owner: 'angular', name: 'dev-infra-test'};
    releaseConfig = {
      npmPackages: ['@angular/dev-infra-test-pkg'],
      buildPackages: async () => [],
      releaseNotes: {}
    };

    // The label determination will print warn messages. These should not be
    // printed to the console, so we turn `console.warn` into a spy.
    spyOn(console, 'warn');
  });

  afterEach(() => nock.cleanAll());

  async function computeTargetLabels(): Promise<TargetLabel[]> {
    return getDefaultTargetLabelConfiguration(api, githubConfig, releaseConfig);
  }

  function getRepoApiRequestUrl(): string {
    return `${API_ENDPOINT}/repos/${githubConfig.owner}/${githubConfig.name}`;
  }

  /**
   * Mocks a branch `package.json` version API request.
   * https://docs.github.com/en/rest/reference/repos#get-repository-content.
   */
  function interceptBranchVersionRequest(branchName: string, version: string) {
    nock(getRepoApiRequestUrl())
        .get('/contents/%2Fpackage.json')
        .query(params => params.ref === branchName)
        .reply(200, {content: Buffer.from(JSON.stringify({version})).toString('base64')});
  }

  /** Fakes a prompt confirm question with the given value. */
  function fakePromptConfirmValue(returnValue: boolean) {
    spyOn(console, 'promptConfirm').and.resolveTo(returnValue);
  }

  /** Fakes a NPM package query API request. */
  function fakeNpmPackageQueryRequest(data: Partial<NpmPackageInfo>) {
    _npmPackageInfoCache[releaseConfig.npmPackages[0]] =
        Promise.resolve({'dist-tags': {}, versions: {}, time: {}, ...data});
  }

  /**
   * Mocks a repository branch list API request.
   * https://docs.github.com/en/rest/reference/repos#list-branches.
   */
  function interceptBranchesListRequest(branches: string[]) {
    nock(getRepoApiRequestUrl())
        .get('/branches')
        .query(true)
        .reply(200, branches.slice(0, 29).map(name => ({name})));
  }

  /**
   * Mocks a repository branch list API request with pagination.
   * https://docs.github.com/en/rest/guides/traversing-with-pagination.
   * https://docs.github.com/en/rest/reference/repos#list-branches.
   */
  function interceptBranchesListRequestWithPagination(branches: string[]) {
    const apiUrl = getRepoApiRequestUrl();

    // For each branch, create its own API page so that pagination is required
    // to resolve all given branches.
    for (let index = 0; index < branches.length; index++) {
      // Pages start with `1` as per the Github API specification.
      const pageNum = index + 1;
      const name = branches[index];
      const linkHeader =
          buildGithubPaginationResponseHeader(branches.length, pageNum, `${apiUrl}/branches`);

      // For the first page, either `?page=1` needs to be set, or no `page` should be specified.
      const queryMatch = pageNum === 1 ?
          (params: ParsedUrlQuery) => params.page === '1' || params.page === undefined :
          {page: pageNum};

      nock(getRepoApiRequestUrl()).get('/branches').query(queryMatch).reply(200, [{name}], {
        link: linkHeader,
      });
    }
  }

  async function getBranchesForLabel(
      name: string, githubTargetBranch = 'master', labels?: TargetLabel[]): Promise<string[]|null> {
    if (labels === undefined) {
      labels = await computeTargetLabels();
    }
    let label: TargetLabel;
    try {
      label = getTargetLabelFromPullRequest({labels}, [name]);
    } catch (error) {
      return null;
    }
    return await getBranchesFromTargetLabel(label, githubTargetBranch);
  }

  it('should detect "master" as branch for target: minor', async () => {
    interceptBranchVersionRequest('master', '11.0.0-next.0');
    interceptBranchVersionRequest('10.2.x', '10.2.4');

    // Note: We add a few more branches here to ensure that branches API requests are
    // paginated properly. In Angular projects, there are usually many branches so that
    // pagination is ultimately needed to detect the active release trains.
    // See: https://github.com/angular/angular/commit/261b060fa168754db00248d1c5c9574bb19a72b4.
    interceptBranchesListRequestWithPagination(['9.8.x', '10.1.x', '10.2.x']);

    expect(await getBranchesForLabel('target: minor')).toEqual(['master']);
  });

  it('should error if non version-branch is targeted with "target: lts"', async () => {
    interceptBranchVersionRequest('master', '11.0.0-next.0');
    interceptBranchVersionRequest('10.2.x', '10.2.4');
    interceptBranchesListRequest(['10.2.x']);

    await expectAsync(getBranchesForLabel('target: lts', 'master'))
        .toBeRejectedWith(jasmine.objectContaining({
          failureMessage:
              'PR cannot be merged as it does not target a long-term support branch: "master"'
        }));
  });

  it('should error if patch branch is targeted with "target: lts"', async () => {
    interceptBranchVersionRequest('master', '11.0.0-next.0');
    interceptBranchVersionRequest('10.2.x', '10.2.4');
    interceptBranchesListRequest(['10.2.x']);

    await expectAsync(getBranchesForLabel('target: lts', '10.2.x'))
        .toBeRejectedWith(jasmine.objectContaining({
          failureMessage:
              'PR cannot be merged with "target: lts" into patch branch. Consider changing the ' +
              'label to "target: patch" if this is intentional.'
        }));
  });

  it('should error if feature-freeze branch is targeted with "target: lts"', async () => {
    interceptBranchVersionRequest('master', '11.0.0-next.0');
    interceptBranchVersionRequest('10.2.x', '10.2.0-next.0');
    interceptBranchVersionRequest('10.1.x', '10.1.0');
    interceptBranchesListRequest(['10.1.x', '10.2.x']);

    await expectAsync(getBranchesForLabel('target: lts', '10.2.x'))
        .toBeRejectedWith(jasmine.objectContaining({
          failureMessage:
              'PR cannot be merged with "target: lts" into feature-freeze/release-candidate branch. ' +
              'Consider changing the label to "target: rc" if this is intentional.'
        }));
  });

  it('should error if release-candidate branch is targeted with "target: lts"', async () => {
    interceptBranchVersionRequest('master', '11.0.0-next.0');
    interceptBranchVersionRequest('10.2.x', '10.2.0-rc.0');
    interceptBranchVersionRequest('10.1.x', '10.1.0');
    interceptBranchesListRequest(['10.1.x', '10.2.x']);

    await expectAsync(getBranchesForLabel('target: lts', '10.2.x'))
        .toBeRejectedWith(jasmine.objectContaining({
          failureMessage:
              'PR cannot be merged with "target: lts" into feature-freeze/release-candidate branch. ' +
              'Consider changing the label to "target: rc" if this is intentional.'
        }));
  });

  it('should error if branch targeted with "target: lts" is no longer active', async () => {
    interceptBranchVersionRequest('master', '11.1.0-next.0');
    interceptBranchVersionRequest('11.0.x', '11.0.0');
    interceptBranchVersionRequest('10.5.x', '10.5.1');
    interceptBranchesListRequest(['10.5.x', '11.0.x']);

    // We support forcibly proceeding with merging if a given branch previously was in LTS mode
    // but no longer is (after a period of time). In this test, we are not forcibly proceeding.
    fakePromptConfirmValue(false);
    fakeNpmPackageQueryRequest({
      'dist-tags': {
        'v10-lts': '10.5.1',
      },
      'time': {
        // v10 has been released at the given specified date. We pick a date that
        // guarantees that the version is no longer considered as active LTS version.
        '10.0.0': new Date(1912, 5, 23).toISOString(),
      }
    });

    await expectAsync(getBranchesForLabel('target: lts', '10.5.x'))
        .toBeRejectedWith(jasmine.objectContaining({
          failureMessage:
              'Long-term supported ended for v10 on 12/23/1913. Pull request cannot be merged ' +
              'into the 10.5.x branch.'
        }));
  });

  it('should error if branch targeted with "target: lts" is not latest LTS for given major',
     async () => {
       interceptBranchVersionRequest('master', '11.1.0-next.0');
       interceptBranchVersionRequest('11.0.x', '11.0.0');
       interceptBranchVersionRequest('10.5.x', '10.5.1');
       interceptBranchVersionRequest('10.4.x', '10.4.4');
       interceptBranchesListRequest(['10.4.x', '10.5.x', '11.0.x']);

       fakeNpmPackageQueryRequest({
         'dist-tags': {
           'v10-lts': '10.5.1',
         }
       });

       await expectAsync(getBranchesForLabel('target: lts', '10.4.x'))
           .toBeRejectedWith(jasmine.objectContaining({
             failureMessage:
                 'Not using last-minor branch for v10 LTS version. PR should be updated to ' +
                 'target: 10.5.x'
           }));
     });

  it('should error if branch targeted with "target: lts" is not a major version with LTS',
     async () => {
       interceptBranchVersionRequest('master', '11.1.0-next.0');
       interceptBranchVersionRequest('11.0.x', '11.0.0');
       interceptBranchVersionRequest('10.5.x', '10.5.1');
       interceptBranchesListRequest(['10.5.x', '11.0.x']);

       fakeNpmPackageQueryRequest({'dist-tags': {}});

       await expectAsync(getBranchesForLabel('target: lts', '10.5.x'))
           .toBeRejectedWith(
               jasmine.objectContaining({failureMessage: 'No LTS version tagged for v10 in NPM.'}));
     });

  it('should allow forcibly proceeding with merge if branch targeted with "target: lts" is no ' +
         'longer active',
     async () => {
       interceptBranchVersionRequest('master', '11.1.0-next.0');
       interceptBranchVersionRequest('11.0.x', '11.0.0');
       interceptBranchVersionRequest('10.5.x', '10.5.1');
       interceptBranchesListRequest(['10.5.x', '11.0.x']);

       // We support forcibly proceeding with merging if a given branch previously was in LTS mode
       // but no longer is (after a period of time). In this test, we are forcibly proceeding and
       // expect the Github target branch to be picked up as branch for the `target: lts` label.
       fakePromptConfirmValue(true);
       fakeNpmPackageQueryRequest({
         'dist-tags': {
           'v10-lts': '10.5.1',
         },
         'time': {
           // v10 has been released at the given specified date. We pick a date that
           // guarantees that the version is no longer considered as active LTS version.
           '10.0.0': new Date(1912, 5, 23).toISOString(),
         }
       });

       expect(await getBranchesForLabel('target: lts', '10.5.x')).toEqual(['10.5.x']);
     });

  it('should use target branch for "target: lts" if it matches an active LTS branch', async () => {
    interceptBranchVersionRequest('master', '11.1.0-next.0');
    interceptBranchVersionRequest('11.0.x', '11.0.0');
    interceptBranchVersionRequest('10.5.x', '10.5.1');
    interceptBranchesListRequest(['10.5.x', '11.0.x']);

    fakeNpmPackageQueryRequest({
      'dist-tags': {
        'v10-lts': '10.5.1',
      },
      'time': {
        '10.0.0': new Date().toISOString(),
      }
    });

    expect(await getBranchesForLabel('target: lts', '10.5.x')).toEqual(['10.5.x']);
  });

  it('should error if no active branch for given major version could be found', async () => {
    interceptBranchVersionRequest('master', '12.0.0-next.0');
    interceptBranchesListRequest(['9.0.x', '9.1.x']);

    await expectAsync(getBranchesForLabel('target: lts', '10.2.x'))
        .toBeRejectedWithError(
            'Unable to determine the latest release-train. The following branches have ' +
            'been considered: []');
  });

  it('should error if invalid version is set for version-branch', async () => {
    interceptBranchVersionRequest('master', '11.2.0-next.0');
    interceptBranchVersionRequest('11.1.x', '11.1.x');
    interceptBranchesListRequest(['11.1.x']);

    await expectAsync(getBranchesForLabel('target: lts', '10.2.x'))
        .toBeRejectedWithError('Invalid version detected in following branch: 11.1.x.');
  });

  it('should error if version-branch more recent than "next" is discovered', async () => {
    interceptBranchVersionRequest('master', '11.2.0-next.0');
    interceptBranchVersionRequest('11.3.x', '11.3.0-next.0');
    interceptBranchVersionRequest('11.1.x', '11.1.5');
    interceptBranchesListRequest(['11.1.x', '11.3.x']);

    await expectAsync(getBranchesForLabel('target: lts', '10.2.x'))
        .toBeRejectedWithError(
            'Discovered unexpected version-branch "11.3.x" for a release-train that is ' +
            'more recent than the release-train currently in the "master" branch. Please ' +
            'either delete the branch if created by accident, or update the outdated version ' +
            'in the next branch (master).');
  });

  it('should error if branch is matching with release-train in the "next" branch', async () => {
    interceptBranchVersionRequest('master', '11.2.0-next.0');
    interceptBranchVersionRequest('11.2.x', '11.2.0-next.0');
    interceptBranchVersionRequest('11.1.x', '11.1.5');
    interceptBranchesListRequest(['11.1.x', '11.2.x']);

    await expectAsync(getBranchesForLabel('target: lts', '10.2.x'))
        .toBeRejectedWithError(
            'Discovered unexpected version-branch "11.2.x" for a release-train that is already ' +
            'active in the "master" branch. Please either delete the branch if created by ' +
            'accident, or update the version in the next branch (master).');
  });

  it('should allow merging PR only into patch branch with "target: patch"', async () => {
    interceptBranchVersionRequest('master', '11.2.0-next.0');
    interceptBranchVersionRequest('11.1.x', '11.1.0');
    interceptBranchesListRequest(['11.1.x']);

    expect(await getBranchesForLabel('target: patch', '11.1.x')).toEqual(['11.1.x']);
  });

  describe('next: major release', () => {
    it('should detect "master" as branch for target: major', async () => {
      interceptBranchVersionRequest('master', '11.0.0-next.0');
      interceptBranchVersionRequest('10.2.x', '10.2.4');
      interceptBranchesListRequest(['10.2.x']);

      expect(await getBranchesForLabel('target: major')).toEqual(['master']);
    });

    describe('without active release-candidate', () => {
      it('should detect last-minor from previous major as branch for target: patch', async () => {
        interceptBranchVersionRequest('master', '11.0.0-next.0');
        interceptBranchVersionRequest('10.2.x', '10.2.4');
        interceptBranchesListRequest(['10.0.x', '10.1.x', '10.2.x']);

        expect(await getBranchesForLabel('target: patch')).toEqual(['master', '10.2.x']);
      });

      it('should error if "target: rc" is applied', async () => {
        interceptBranchVersionRequest('master', '11.0.0-next.0');
        interceptBranchVersionRequest('10.2.x', '10.2.4');
        interceptBranchesListRequest(['10.0.x', '10.1.x', '10.2.x']);

        await expectAsync(getBranchesForLabel('target: rc'))
            .toBeRejectedWith(jasmine.objectContaining({
              failureMessage:
                  'No active feature-freeze/release-candidate branch. Unable to merge ' +
                  'pull request using "target: rc" label.'
            }));
      });
    });

    describe('with active release-candidate', () => {
      it('should detect most recent non-prerelease minor branch from previous major for ' +
             'target: patch',
         async () => {
           interceptBranchVersionRequest('master', '11.0.0-next.0');
           interceptBranchVersionRequest('10.2.x', '10.2.0-rc.0');
           interceptBranchVersionRequest('10.1.x', '10.2.3');
           interceptBranchesListRequest(['10.1.x', '10.2.x']);

           // Pull requests should also be merged into the RC and `next` (i.e. `master`) branch.
           expect(await getBranchesForLabel('target: patch')).toEqual([
             'master', '10.1.x', '10.2.x'
           ]);
         });

      it('should detect release-candidate branch for "target: rc"', async () => {
        interceptBranchVersionRequest('master', '11.0.0-next.0');
        interceptBranchVersionRequest('10.2.x', '10.2.0-rc.0');
        interceptBranchVersionRequest('10.1.x', '10.1.0');
        interceptBranchesListRequest(['10.0.x', '10.1.x', '10.2.x']);

        expect(await getBranchesForLabel('target: rc')).toEqual(['master', '10.2.x']);
      });

      it('should detect feature-freeze branch with "target: rc"', async () => {
        interceptBranchVersionRequest('master', '11.0.0-next.0');
        interceptBranchVersionRequest('10.2.x', '10.2.0-next.0');
        interceptBranchVersionRequest('10.1.x', '10.1.0');
        interceptBranchesListRequest(['10.0.x', '10.1.x', '10.2.x']);

        expect(await getBranchesForLabel('target: rc')).toEqual(['master', '10.2.x']);
      });

      it('should error if multiple consecutive release-candidate branches are found', async () => {
        interceptBranchVersionRequest('master', '11.0.0-next.0');
        interceptBranchVersionRequest('10.4.x', '10.4.0-next.0');
        interceptBranchVersionRequest('10.3.x', '10.4.0-rc.5');
        interceptBranchesListRequest(['10.3.x', '10.4.x']);

        await expectAsync(getBranchesForLabel('target: patch'))
            .toBeRejectedWithError(
                'Unable to determine latest release-train. Found two consecutive ' +
                'branches in feature-freeze/release-candidate phase. Did not expect both ' +
                '"10.3.x" and "10.4.x" to be in feature-freeze/release-candidate mode.');
      });
    });
  });

  describe('next: minor release', () => {
    it('should error if "target: major" is applied', async () => {
      interceptBranchVersionRequest('master', '11.2.0-next.0');
      interceptBranchVersionRequest('11.1.x', '11.1.4');
      interceptBranchesListRequest(['11.1.x']);

      await expectAsync(getBranchesForLabel('target: major'))
          .toBeRejectedWith(jasmine.objectContaining({
            failureMessage:
                'Unable to merge pull request. The "master" branch will be released as ' +
                'a minor version.',
          }));
    });

    describe('without active release-candidate', () => {
      it('should detect last-minor from previous major as branch for target: patch', async () => {
        interceptBranchVersionRequest('master', '11.2.0-next.0');
        interceptBranchVersionRequest('11.1.x', '11.1.0');
        interceptBranchesListRequest(['11.1.x']);

        expect(await getBranchesForLabel('target: patch')).toEqual(['master', '11.1.x']);
      });

      it('should error if "target: rc" is applied', async () => {
        interceptBranchVersionRequest('master', '11.2.0-next.0');
        interceptBranchVersionRequest('11.1.x', '11.1.0');
        interceptBranchesListRequest(['11.1.x']);

        await expectAsync(getBranchesForLabel('target: rc'))
            .toBeRejectedWith(jasmine.objectContaining({
              failureMessage:
                  'No active feature-freeze/release-candidate branch. Unable to merge pull ' +
                  'request using "target: rc" label.'
            }));
      });
    });

    describe('with active release-candidate', () => {
      it('should detect most recent non-prerelease minor branch from previous major for ' +
             'target: patch',
         async () => {
           interceptBranchVersionRequest('master', '11.2.0-next.0');
           interceptBranchVersionRequest('11.1.x', '11.1.0-rc.0');
           interceptBranchVersionRequest('11.0.x', '11.0.0');
           interceptBranchesListRequest(['11.0.x', '11.1.x']);

           // Pull requests should also be merged into the RC and `next` (i.e. `master`) branch.
           expect(await getBranchesForLabel('target: patch')).toEqual([
             'master', '11.0.x', '11.1.x'
           ]);
         });

      it('should detect release-candidate branch for "target: rc"', async () => {
        interceptBranchVersionRequest('master', '11.2.0-next.0');
        interceptBranchVersionRequest('11.1.x', '11.1.0-rc.0');
        interceptBranchVersionRequest('11.0.x', '10.0.0');
        interceptBranchesListRequest(['11.0.x', '11.1.x']);

        expect(await getBranchesForLabel('target: rc')).toEqual(['master', '11.1.x']);
      });

      it('should detect feature-freeze branch with "target: rc"', async () => {
        interceptBranchVersionRequest('master', '11.2.0-next.0');
        interceptBranchVersionRequest('11.1.x', '11.1.0-next.0');
        interceptBranchVersionRequest('11.0.x', '10.0.0');
        interceptBranchesListRequest(['11.0.x', '11.1.x']);

        expect(await getBranchesForLabel('target: rc')).toEqual(['master', '11.1.x']);
      });
    });
  });
});
