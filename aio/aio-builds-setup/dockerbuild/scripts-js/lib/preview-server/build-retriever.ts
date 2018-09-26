import * as fs from 'fs';
import fetch from 'node-fetch';
import {dirname} from 'path';
import {mkdir} from 'shelljs';
import {promisify} from 'util';
import {CircleCiApi} from '../common/circle-ci-api';
import {assert, assertNotMissingOrEmpty, computeArtifactDownloadPath, Logger} from '../common/utils';
import {PreviewServerError} from './preview-error';

export interface GithubInfo {
  org: string;
  pr: number;
  repo: string;
  sha: string;
  success: boolean;
}

/**
 * A helper that can get information about builds and download build artifacts.
 */
export class BuildRetriever {
  private logger = new Logger('BuildRetriever');
  constructor(private api: CircleCiApi, private downloadSizeLimit: number, private downloadDir: string) {
    assert(downloadSizeLimit > 0, 'Invalid parameter "downloadSizeLimit" should be a number greater than 0.');
    assertNotMissingOrEmpty('downloadDir', downloadDir);
  }

  /**
   * Get GitHub information about a build
   * @param buildNum The number of the build for which to retrieve the info.
   * @returns The Github org, repo, PR and latest SHA for the specified build.
   */
  public async getGithubInfo(buildNum: number): Promise<GithubInfo> {
    const buildInfo = await this.api.getBuildInfo(buildNum);
    const githubInfo: GithubInfo = {
      org: buildInfo.username,
      pr: getPrFromBranch(buildInfo.branch),
      repo: buildInfo.reponame,
      sha: buildInfo.vcs_revision,
      success: !buildInfo.failed,
    };
    return githubInfo;
  }

  /**
   * Make a request to the given URL for a build artifact and store it locally.
   * @param buildNum the number of the CircleCI build whose artifact we want to download.
   * @param pr the number of the PR that triggered the CircleCI build.
   * @param sha the commit in the PR that triggered the CircleCI build.
   * @param artifactPath the path on CircleCI where the artifact was stored.
   * @returns A promise to the file path where the downloaded file was stored.
   */
  public async downloadBuildArtifact(buildNum: number, pr: number, sha: string, artifactPath: string): Promise<string> {
    try {
      const outPath = computeArtifactDownloadPath(this.downloadDir, pr, sha, artifactPath);
      const downloadExists = await new Promise(resolve => fs.exists(outPath, exists => resolve(exists)));
      if (!downloadExists) {
        const url = await this.api.getBuildArtifactUrl(buildNum, artifactPath);
        const response = await fetch(url, {size: this.downloadSizeLimit});
        if (response.status !== 200) {
          throw new PreviewServerError(response.status, `Error ${response.status} - ${response.statusText}`);
        }
        const buffer = await response.buffer();
        mkdir('-p', dirname(outPath));
        await promisify(fs.writeFile)(outPath, buffer);
      }
      return outPath;
    } catch (error) {
      this.logger.warn(error);
      const status = (error.type === 'max-size') ? 413 : 500;
      throw new PreviewServerError(status, `CircleCI artifact download failed (${error.message || error})`);
    }
  }
}

function getPrFromBranch(branch: string): number {
  // CircleCI only exposes PR numbers via the `branch` field :-(
  const match = /^pull\/(\d+)$/.exec(branch);
  if (!match) {
    throw new Error(`No PR found in branch field: ${branch}`);
  }
  return +match[1];
}
