/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getAngularDevConfig} from '../../utils/config';

import {GithubApiMergeStrategyConfig} from './strategies/api-merge';

/**
 * Possible merge methods supported by the Github API.
 * https://developer.github.com/v3/pulls/#merge-a-pull-request-merge-button.
 */
export type GithubApiMergeMethod = 'merge'|'squash'|'rebase';

/**
 * Target labels represent Github pull requests labels. These labels instruct the merge
 * script into which branches a given pull request should be merged to.
 */
export interface TargetLabel {
  /** Pattern that matches the given target label. */
  pattern: RegExp|string;
  /**
   * List of branches a pull request with this target label should be merged into.
   * Can also be wrapped in a function that accepts the target branch specified in the
   * Github Web UI. This is useful for supporting labels like `target: development-branch`.
   */
  branches: string[]|((githubTargetBranch: string) => string[]);
}

/** Configuration for the merge script. */
export interface MergeConfig {
  /** Configuration for the upstream repository. */
  repository: {user: string; name: string; useSsh?: boolean};
  /** List of target labels. */
  labels: TargetLabel[];
  /** Required base commits for given branches. */
  requiredBaseCommits?: {[branchName: string]: string};
  /** Pattern that matches labels which imply a signed CLA. */
  claSignedLabel: string|RegExp;
  /** Pattern that matches labels which imply a merge ready pull request. */
  mergeReadyLabel: string|RegExp;
  /** Label which can be applied to fixup commit messages in the merge script. */
  commitMessageFixupLabel: string|RegExp;
  /**
   * Whether pull requests should be merged using the Github API. This can be enabled
   * if projects want to have their pull requests show up as `Merged` in the Github UI.
   * The downside is that fixup or squash commits no longer work as the Github API does
   * not support this.
   */
  githubApiMerge: false|GithubApiMergeStrategyConfig;
}

/** Loads and validates the merge configuration. */
export function loadAndValidateConfig(): {config?: MergeConfig, errors?: string[]} {
  const config = getAngularDevConfig<'merge', MergeConfig>().merge;
  if (config === undefined) {
    return {
      errors: ['No merge configuration found. Set the `merge` configuration.']
    }
  }
  const errors = validateConfig(config);
  if (errors.length) {
    return {errors};
  }
  return {config};
}

/** Validates the specified configuration. Returns a list of failure messages. */
function validateConfig(config: MergeConfig): string[] {
  const errors: string[] = [];
  if (!config.labels) {
    errors.push('No label configuration.');
  } else if (!Array.isArray(config.labels)) {
    errors.push('Label configuration needs to be an array.');
  }
  if (!config.repository) {
    errors.push('No repository is configured.');
  } else if (!config.repository.user || !config.repository.name) {
    errors.push('Repository configuration needs to specify a `user` and repository `name`.');
  }
  if (!config.claSignedLabel) {
    errors.push('No CLA signed label configured.');
  }
  if (!config.mergeReadyLabel) {
    errors.push('No merge ready label configured.');
  }
  if (config.githubApiMerge === undefined) {
    errors.push('No explicit choice of merge strategy. Please set `githubApiMerge`.');
  }
  return errors;
}
