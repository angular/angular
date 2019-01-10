import {GithubApi} from './github-api';
import {assert, assertNotMissingOrEmpty} from './utils';

export interface PullRequest {
  number: number;
  user: {login: string};
  labels: {name: string}[];
}

export interface FileInfo {
  sha: string;
  filename: string;
}

export type PullRequestState = 'all' | 'closed' | 'open';

/**
 * Access pull requests on GitHub.
 */
export class GithubPullRequests {
  public repoSlug: string;

  /**
   * Create an instance of this helper
   * @param api An instance of the Github API helper.
   * @param githubOrg The organisation on GitHub whose repo we will interrogate.
   * @param githubRepo The repository on Github with whose PRs we will interact.
   */
  constructor(private api: GithubApi, githubOrg: string, githubRepo: string) {
    assertNotMissingOrEmpty('githubOrg', githubOrg);
    assertNotMissingOrEmpty('githubRepo', githubRepo);
    this.repoSlug = `${githubOrg}/${githubRepo}`;
  }

  /**
   * Post a comment on a PR.
   * @param pr The number of the PR on which to comment.
   * @param body The body of the comment to post.
   * @returns A promise that resolves when the comment has been posted.
   */
  public addComment(pr: number, body: string): Promise<any> {
    assert(pr > 0, `Invalid PR number: ${pr}`);
    assert(!!body, `Invalid or empty comment body: ${body}`);
    return this.api.post<any>(`/repos/${this.repoSlug}/issues/${pr}/comments`, null, {body});
  }

  /**
   * Request information about a PR.
   * @param pr The number of the PR for which to request info.
   * @returns A promise that is resolves with information about the specified PR.
   */
  public fetch(pr: number): Promise<PullRequest> {
    assert(pr > 0, `Invalid PR number: ${pr}`);
    // Using the `/issues/` URL, because the `/pulls/` one does not provide labels.
    return this.api.get<PullRequest>(`/repos/${this.repoSlug}/issues/${pr}`);
  }

  /**
   * Request information about all PRs that match the given state.
   * @param state Only retrieve PRs that have this state.
   * @returns A promise that is resolved with information about the requested PRs.
   */
  public fetchAll(state: PullRequestState = 'all'): Promise<PullRequest[]> {
    const pathname = `/repos/${this.repoSlug}/pulls`;
    const params = {state};

    return this.api.getPaginated<PullRequest>(pathname, params);
  }

  /**
   * Request a list of files for the given PR.
   * @param pr The number of the PR for which to request files.
   * @returns A promise that resolves to an array of file information
   */
  public fetchFiles(pr: number): Promise<FileInfo[]> {
    assert(pr > 0, `Invalid PR number: ${pr}`);
    return this.api.getPaginated<FileInfo>(`/repos/${this.repoSlug}/pulls/${pr}/files`);
  }
}
