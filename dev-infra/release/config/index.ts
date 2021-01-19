/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as semver from 'semver';

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
  buildPackages: () => Promise<BuiltPackage[]|null>;
  /** Generates the release notes from the most recent tag to `HEAD`. */
  generateReleaseNotesForHead: (outputPath: string) => Promise<void>;
  /**
   * Gets a pattern for extracting the release notes of the a given version.
   * @returns A pattern matching the notes for a given version (including the header).
   */
  // TODO: Remove this in favor of a canonical changelog format across the Angular organization.
  extractReleaseNotesPattern?: (version: semver.SemVer) => RegExp;
  /** The list of github labels to add to the release PRs. */
  releasePrLabels?: string[];
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
  if (config.release?.generateReleaseNotesForHead === undefined) {
    errors.push(`No "generateReleaseNotesForHead" function configured for releasing.`);
  }

  assertNoErrors(errors);
  return config.release!;
}
