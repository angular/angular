/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertNoErrors, getConfig, NgDevConfig} from '../../utils/config';

/** Interface describing a built package. */
export interface BuiltPackage {
  /** Name of the package. */
  name: string;
  /** Path to the package output directory. */
  outputPath: string;
}

/** Configuration for staging and publishing a release. */
export interface ReleaseConfig {
  /** Registry URL used for publishing release packages. Defaults to the NPM registry. */
  publishRegistry?: string;
  /** List of NPM packages that are published as part of this project. */
  npmPackages: string[];
  /** Builds release packages and returns a list of paths pointing to the output. */
  buildPackages: (stampForRelease?: boolean) => Promise<BuiltPackage[]|null>;
  /** The list of github labels to add to the release PRs. */
  releasePrLabels?: string[];
  /** Configuration for creating release notes during publishing. */
  releaseNotes: ReleaseNotesConfig;
}

/** Configuration for creating release notes during publishing. */
export interface ReleaseNotesConfig {
  /** Whether to prompt for and include a release title in the generated release notes. */
  useReleaseTitle?: boolean;
  /** List of commit scopes to disclude from generated release notes. */
  hiddenScopes?: string[];
  /**
   * List of commit groups, either {npmScope}/{scope} or {scope}, to use for ordering.
   *
   * Each group for the release notes, will appear in the order provided in groupOrder and any other
   * groups will appear after these groups, sorted by `Array.sort`'s default sorting order.
   */
  groupOrder?: string[];
}

/** Configuration for releases in the dev-infra configuration. */
export type DevInfraReleaseConfig = NgDevConfig<{release: ReleaseConfig}>;

/** Retrieve and validate the config as `ReleaseConfig`. */
export function getReleaseConfig(config: Partial<DevInfraReleaseConfig> = getConfig()):
    ReleaseConfig {
  // List of errors encountered validating the config.
  const errors: string[] = [];

  if (config.release === undefined) {
    errors.push(`No configuration defined for "release"`);
  }
  if (config.release?.npmPackages === undefined) {
    errors.push(`No "npmPackages" configured for releasing.`);
  }
  if (config.release?.buildPackages === undefined) {
    errors.push(`No "buildPackages" function configured for releasing.`);
  }
  if (config.release?.releaseNotes === undefined) {
    errors.push(`No "releaseNotes" configured for releasing.`);
  }

  assertNoErrors(errors);
  return config.release!;
}
