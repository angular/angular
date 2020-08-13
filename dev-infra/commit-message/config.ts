/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertNoErrors, getConfig, NgDevConfig} from '../utils/config';

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

/** Scope requirement level to be set for each commit type.  */
export enum ScopeRequirement {
  Required,
  Optional,
  Forbidden,
}

/** A commit type */
export interface CommitType {
  scope: ScopeRequirement;
}

/** The valid commit types for Angular commit messages. */
export const COMMIT_TYPES: {[key: string]: CommitType} = {
  build: {
    scope: ScopeRequirement.Forbidden,
  },
  ci: {
    scope: ScopeRequirement.Forbidden,
  },
  docs: {
    scope: ScopeRequirement.Optional,
  },
  feat: {
    scope: ScopeRequirement.Required,
  },
  fix: {
    scope: ScopeRequirement.Required,
  },
  perf: {
    scope: ScopeRequirement.Required,
  },
  refactor: {
    scope: ScopeRequirement.Required,
  },
  release: {
    scope: ScopeRequirement.Forbidden,
  },
  test: {
    scope: ScopeRequirement.Required,
  },
};
