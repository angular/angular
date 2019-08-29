// Imports
import fetch from 'node-fetch';
import {assertNotMissingOrEmpty} from './utils';

// Constants
const CIRCLE_CI_API_URL = 'https://circleci.com/api/v1.1/project/github';

// Interfaces - Types
export interface ArtifactInfo {
  path: string;
  pretty_path: string;
  node_index: number;
  url: string;
}

export type ArtifactResponse = ArtifactInfo[];

export interface BuildInfo {
  reponame: string;
  failed: boolean;
  branch: string;
  username: string;
  build_num: number;
  has_artifacts: boolean;
  outcome: string; // e.g. 'success'
  vcs_revision: string; // HEAD SHA
  // there are other fields but they are not used in this code
}

/**
 * A Helper that can interact with the CircleCI API.
 */
export class CircleCiApi {

  private tokenParam = `circle-token=${this.circleCiToken}`;

  /**
   * Construct a helper that can interact with the CircleCI REST API.
   * @param githubOrg The Github organisation whose repos we want to access in CircleCI (e.g. angular).
   * @param githubRepo The Github repo whose builds we want to access in CircleCI (e.g. angular).
   * @param circleCiToken The CircleCI API access token (secret).
   */
  constructor(
    private githubOrg: string,
    private githubRepo: string,
    private circleCiToken: string,
  ) {
    assertNotMissingOrEmpty('githubOrg', githubOrg);
    assertNotMissingOrEmpty('githubRepo', githubRepo);
    assertNotMissingOrEmpty('circleCiToken', circleCiToken);
  }

  /**
   * Get the info for a build from the CircleCI API
   * @param buildNumber The CircleCI build number that generated the artifact.
   * @returns A promise to the info about the build
   */
  public async getBuildInfo(buildNumber: number): Promise<BuildInfo> {
    try {
      const baseUrl = `${CIRCLE_CI_API_URL}/${this.githubOrg}/${this.githubRepo}/${buildNumber}`;
      const response = await fetch(`${baseUrl}?${this.tokenParam}`);
      if (response.status !== 200) {
        throw new Error(`${baseUrl}: ${response.status} - ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
        throw new Error(`CircleCI build info request failed (${error.message})`);
    }
  }

  /**
   * Query the CircleCI API to get a URL for a specified artifact from a specified build.
   * @param artifactPath The path, within the build to the artifact.
   * @returns A promise to the URL that can be requested to download the actual build artifact file.
   */
  public async getBuildArtifactUrl(buildNumber: number, artifactPath: string): Promise<string> {
    const baseUrl = `${CIRCLE_CI_API_URL}/${this.githubOrg}/${this.githubRepo}/${buildNumber}`;
    try {
      const response = await fetch(`${baseUrl}/artifacts?${this.tokenParam}`);
      const artifacts = await response.json() as ArtifactResponse;
      const artifact = artifacts.find(item => item.path === artifactPath);
      if (!artifact) {
        throw new Error(`Missing artifact (${artifactPath}) for CircleCI build: ${buildNumber}`);
      }
      return artifact.url;
    } catch (error) {
      throw new Error(`CircleCI artifact URL request failed (${error.message})`);
    }
  }
}
