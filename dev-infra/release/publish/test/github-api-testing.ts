/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as nock from 'nock';

/**
 * Class that represents a Github repository in testing. The class can be
 * used to intercept and except Github API requests for release actions.
 */
export class GithubTestingRepo {
  /** Github API endpoint. */
  private apiEndpoint = `https://api.github.com`;

  /** Github API url for the given repository. */
  private repoApiUrl = `${this.apiEndpoint}/repos/${this.owner}/${this.name}`;

  constructor(public owner: string, public name: string) {}

  expectPullRequestToBeCreated(
      baseBranch: string, fork: GithubTestingRepo, forkBranch: string, prNumber: number): this {
    const expectedHead = `${fork.owner}:${forkBranch}`;
    nock(this.repoApiUrl)
        .post('/pulls', ({base, head}) => base === baseBranch && head === expectedHead)
        .reply(200, {number: prNumber});
    return this;
  }

  expectBranchRequest(branchName: string, sha: string|null): this {
    nock(this.repoApiUrl)
        .get(`/branches/${branchName}`)
        .reply(sha ? 200 : 404, sha ? {commit: {sha}} : undefined);
    return this;
  }

  expectFindForkRequest(fork: GithubTestingRepo): this {
    nock(this.apiEndpoint)
        .post(
            '/graphql',
            ({variables}) => variables.owner === this.owner && variables.name === this.name)
        .reply(200, {
          data: {repository: {forks: {nodes: [{owner: {login: fork.owner}, name: fork.name}]}}}
        });
    return this;
  }

  expectCommitStatusCheck(sha: string, state: 'success'|'pending'|'failure'): this {
    nock(this.repoApiUrl).get(`/commits/${sha}/status`).reply(200, {state}).activeMocks();
    return this;
  }

  expectPullRequestWait(prNumber: number): this {
    // The pull request state could be queried multiple times, so we persist
    // this mock request. By default, nock only mocks requests once.
    nock(this.repoApiUrl).get(`/pulls/${prNumber}`).reply(200, {merged: true}).persist();
    return this;
  }

  expectCommitRequest(sha: string, message: string): this {
    nock(this.repoApiUrl).get(`/commits/${sha}`).reply(200, {commit: {message}});
    return this;
  }

  expectTagToBeCreated(tagName: string, sha: string): this {
    nock(this.repoApiUrl)
        .post(`/git/refs`, b => b.ref === `refs/tags/${tagName}` && b.sha === sha)
        .reply(200, {});
    return this;
  }

  expectReleaseToBeCreated(name: string, tagName: string): this {
    nock(this.repoApiUrl)
        .post('/releases', b => b.name === name && b['tag_name'] === tagName)
        .reply(200, {});
    return this;
  }
}
