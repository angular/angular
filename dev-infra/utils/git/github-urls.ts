/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {URL} from 'url';
import {GithubConfig} from '../config';
import {GitClient} from './index';

/** URL to the Github page where personal access tokens can be managed. */
export const GITHUB_TOKEN_SETTINGS_URL = 'https://github.com/settings/tokens';

/** URL to the Github page where personal access tokens can be generated. */
export const GITHUB_TOKEN_GENERATE_URL = 'https://github.com/settings/tokens/new';

/** Adds the provided token to the given Github HTTPs remote url. */
export function addTokenToGitHttpsUrl(githubHttpsUrl: string, token: string) {
  const url = new URL(githubHttpsUrl);
  url.username = token;
  return url.href;
}

/** Gets the repository Git URL for the given github config. */
export function getRepositoryGitUrl(config: GithubConfig, githubToken?: string): string {
  if (config.useSsh) {
    return `git@github.com:${config.owner}/${config.name}.git`;
  }
  const baseHttpUrl = `https://github.com/${config.owner}/${config.name}.git`;
  if (githubToken !== undefined) {
    return addTokenToGitHttpsUrl(baseHttpUrl, githubToken);
  }
  return baseHttpUrl;
}

/** Gets a Github URL that refers to a list of recent commits within a specified branch. */
export function getListCommitsInBranchUrl({remoteParams}: GitClient, branchName: string) {
  return `https://github.com/${remoteParams.owner}/${remoteParams.repo}/commits/${branchName}`;
}
