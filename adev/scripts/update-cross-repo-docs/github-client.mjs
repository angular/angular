/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {get} from 'node:https';
import {posix} from 'node:path';

const GITHUB_API = 'https://api.github.com/repos/';

export class GithubClient {
  #token;
  #ua;
  #api;

  constructor(repo, token, ua) {
    this.#token = token;
    this.#ua = ua;
    this.#api = posix.join(GITHUB_API, repo);
  }

  /**
   * Get the affected files.
   *
   * @param {string} baseSha
   * @param {string} headSha
   * @returns Promise<string[]>
   */
  async getAffectedFiles(baseSha, headSha) {
    const {files} = JSON.parse(await this.#httpGet(`${this.#api}/compare/${baseSha}...${headSha}`));
    return files.map((f) => f.filename);
  }

  /**
   * Get SHA of a branch.
   *
   * @param {string} branch
   * @returns Promise<string>
   */
  async getShaForBranch(branch) {
    const sha = await this.#httpGet(`${this.#api}/commits/${branch}`, {
      headers: {Accept: 'application/vnd.github.VERSION.sha'},
    });

    if (!sha) {
      throw new Error(`Unable to extract the SHA for '${branch}'.`);
    }

    return sha;
  }

  #httpGet(url, options = {}) {
    options.headers ??= {};
    options.headers['Authorization'] = `token ${this.#token}`;
    // User agent is required
    // https://docs.github.com/en/rest/overview/resources-in-the-rest-api?apiVersion=2022-11-28#user-agent-required
    options.headers['User-Agent'] = this.#ua;

    return new Promise((resolve, reject) => {
      get(url, options, (res) => {
        let data = '';
        res
          .on('data', (chunk) => {
            data += chunk;
          })
          .on('end', () => {
            resolve(data);
          });
      }).on('error', (e) => {
        reject(e);
      });
    });
  }
}
