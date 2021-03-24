/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertNoErrors, getConfig, NgDevConfig} from '../utils/config';

/** Configuration for commit-message comands. */
export interface CommitMessageConfig {
  maxLineLength: number;
  minBodyLength: number;
  minBodyLengthTypeExcludes?: string[];
  scopes: string[];
}

/** Retrieve and validate the config as `CommitMessageConfig`. */
export function getCommitMessageConfig() {
  // List of errors encountered validating the config.
  const errors: string[] = [];
  // The non-validated config object.
  const config: Partial<NgDevConfig<{commitMessage: CommitMessageConfig}>> = getConfig();

  if (config.commitMessage === undefined) {
    errors.push(`No configuration defined for "commitMessage"`);
  }

  assertNoErrors(errors);
  return config as Required<typeof config>;
}

/** Scope requirement level to be set for each commit type. */
export enum ScopeRequirement {
  Required,
  Optional,
  Forbidden,
}

/** A commit type */
export interface CommitType {
  description: string;
  name: string;
  scope: ScopeRequirement;
}

/** The valid commit types for Angular commit messages. */
export const COMMIT_TYPES: {[key: string]: CommitType} = {
  build: {
    name: 'build',
    description: 'Changes to local repository build system and tooling',
    scope: ScopeRequirement.Optional,
  },
  ci: {
    name: 'ci',
    description: 'Changes to CI configuration and CI specific tooling',
    scope: ScopeRequirement.Forbidden,
  },
  docs: {
    name: 'docs',
    description: 'Changes which exclusively affects documentation.',
    scope: ScopeRequirement.Optional,
  },
  feat: {
    name: 'feat',
    description: 'Creates a new feature',
    scope: ScopeRequirement.Required,
  },
  fix: {
    name: 'fix',
    description: 'Fixes a previously discovered failure/bug',
    scope: ScopeRequirement.Required,
  },
  perf: {
    name: 'perf',
    description: 'Improves performance without any change in functionality or API',
    scope: ScopeRequirement.Required,
  },
  refactor: {
    name: 'refactor',
    description: 'Refactor without any change in functionality or API (includes style changes)',
    scope: ScopeRequirement.Required,
  },
  release: {
    name: 'release',
    description: 'A release point in the repository',
    scope: ScopeRequirement.Forbidden,
  },
  test: {
    name: 'test',
    description: 'Improvements or corrections made to the project\'s test suite',
    scope: ScopeRequirement.Required,
  },
};
