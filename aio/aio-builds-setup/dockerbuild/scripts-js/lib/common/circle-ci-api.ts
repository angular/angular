// Imports
import fetch, {RequestInit} from 'node-fetch';

import {assertNotMissingOrEmpty} from './utils';

// Constants
const CIRCLE_CI_BASE_API_URL = 'https://circleci.com/api/v2';
const CIRCLE_CI_BUILD_API_URL = `${CIRCLE_CI_BASE_API_URL}/project/gh`;
const CIRCLE_CI_PIPELINE_API_URL = `${CIRCLE_CI_BASE_API_URL}/pipeline`;

// Interfaces - Types

// API docs: https://circleci.com/docs/api/v2#operation/getJobArtifacts
// Example: https://circleci.com/api/v2/project/gh/angular/angular/1163941/artifacts
export interface ArtifactInfo {
  /** The path of this build artifacts. */
  path: string;

  /** The full URL where this artifact can be downloaded from. */
  url: string;

  // There are other fields but they are not used in this code.
}

export type ArtifactResponse = {items: ArtifactInfo[]};

// API docs: https://circleci.com/docs/api/v2#operation/getJobDetails
// Example: https://circleci.com/api/v2/project/gh/angular/angular/job/1163941
export interface BuildInfo {
  /** The job number. */
  number: number;

  /** The job name (e.g. `'aio_preview'`). */
  name: string;

  /** Info about the organization which the project related to this job belongs to. */
  organization: {
    name: string;
  };

  /** Info about the project related to this job. */
  project: {
    name: string;
  };

  /** Info about the [pipeline](https://circleci.com/docs/2.0/pipelines/) that this job is part of. */
  pipeline: {
    id: string;
  };

  // There are other fields but they are not used in this code.
}

// API docs: https://circleci.com/docs/api/v2#operation/getPipelineById
// https://circleci.com/api/v2/pipeline/356227c0-32f6-4f99-bfc2-3938db90a147
export interface PipelineInfo {
  /** The pipeline ID. */
  id: string;

  /** Info related to/retrieved from the version control system provider (e.g. GitHub). */
  vcs: {
    /** The PR number. */
    review_id: string;

    /** The HEAD SHA. */
    revision: string;
  };

  // There are other fields but they are not used in this code.
}

/**
 * A Helper that can interact with the CircleCI API.
 */
export class CircleCiApi {
  /**
   * Construct a helper that can interact with the CircleCI REST API.
   * @param githubOrg The Github organisation whose repos we want to access in CircleCI (e.g.
   *     angular).
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

  public  async fetchFromCircleCi(url: string, params: RequestInit = {}) {
    params.headers = {...params.headers, 'Circle-Token': this.circleCiToken};
    const response = await fetch(url, params);
    if (response.status !== 200) {
      throw new Error(`${url}: ${response.status} - ${response.statusText}`);
    }
    return response;
  }

  /**
   * Get the info for a build (aka job) from the CircleCI API.
   * @param buildNumber The CircleCI build number that generated the artifact.
   * @returns A promise to the info about the build.
   */
  public async getBuildInfo(buildNumber: number): Promise<BuildInfo> {
    try {
      const url = `${CIRCLE_CI_BUILD_API_URL}/${this.githubOrg}/${this.githubRepo}/job/${buildNumber}`;
      const response = await this.fetchFromCircleCi(url);
      return response.json();
    } catch (error) {
      throw new Error(`CircleCI build info request failed (${(error as Error).message})`);
    }
  }

  /**
   * Query the CircleCI API to get a URL for a specified artifact from a specified build.
   * @param artifactPath The path, within the build to the artifact.
   * @returns A promise to the URL that can be requested to download the actual build artifact file.
   */
  public async getBuildArtifactUrl(buildNumber: number, artifactPath: string): Promise<string> {
    const baseUrl = `${CIRCLE_CI_BUILD_API_URL}/${this.githubOrg}/${this.githubRepo}/${buildNumber}`;
    try {
      const response = await this.fetchFromCircleCi(`${baseUrl}/artifacts`);
      const artifacts = await response.json() as ArtifactResponse;
      const artifact = artifacts.items.find(item => item.path === artifactPath);
      if (!artifact) {
        throw new Error(`Missing artifact (${artifactPath}) for CircleCI build: ${buildNumber}`);
      }
      return artifact.url;
    } catch (error) {
      throw new Error(`CircleCI artifact URL request failed (${(error as Error).message})`);
    }
  }

  /**
   * Get the info for a [pipeline](https://circleci.com/docs/2.0/pipelines/) from the CircleCI API.
   * @param pipelineId The CircleCI pipeline ID that generated the artifact.
   * @returns A promise to the info about the pipeline.
   */
  public async getPipelineInfo(pipelineId: string): Promise<PipelineInfo> {
    try {
      const url = `${CIRCLE_CI_PIPELINE_API_URL}/${pipelineId}`;
      const response = await this.fetchFromCircleCi(url);
      return response.json();
    } catch (error) {
      throw new Error(`CircleCI pipeline info request failed (${(error as Error).message})`);
    }
  }
}
