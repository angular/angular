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
export enum SCOPE_REQUIREMENT {
  Required,
  Optional,
  Forbidden,
}

/** A commit type */
export interface CommitType {
  value: string;
  scope: SCOPE_REQUIREMENT;
}

/** The valid commit types for Angular commit messages. */
export const COMMIT_TYPES: {[key: string]: CommitType} = {
  build: {
    value: 'build',
    scope: SCOPE_REQUIREMENT.Forbidden,
  },
  ci: {
    value: 'ci',
    scope: SCOPE_REQUIREMENT.Forbidden,
  },
  docs: {
    value: 'docs',
    scope: SCOPE_REQUIREMENT.Optional,
  },
  feat: {
    value: 'feat',
    scope: SCOPE_REQUIREMENT.Required,
  },
  fix: {
    value: 'fix',
    scope: SCOPE_REQUIREMENT.Required,
  },
  perf: {
    value: 'perf',
    scope: SCOPE_REQUIREMENT.Required,
  },
  refactor: {
    value: 'refactor',
    scope: SCOPE_REQUIREMENT.Required,
  },
  release: {
    value: 'release',
    scope: SCOPE_REQUIREMENT.Forbidden,
  },
  test: {
    value: 'test',
    scope: SCOPE_REQUIREMENT.Required,
  },
};
