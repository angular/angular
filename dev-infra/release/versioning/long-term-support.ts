/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Number of months a major version in Angular is actively supported. See:
 * https://angular.io/guide/releases#support-policy-and-schedule.
 */
export const majorActiveSupportDuration = 6;

/**
 * Number of months a major version has active long-term support. See:
 * https://angular.io/guide/releases#support-policy-and-schedule.
 */
export const majorActiveTermSupportDuration = 12;

/**
 * Computes the date when long-term support ends for a major released at the
 * specified date.
 */
export function computeLtsEndDateOfMajor(majorReleaseDate: Date): Date {
  return new Date(
      majorReleaseDate.getFullYear(),
      majorReleaseDate.getMonth() + majorActiveSupportDuration + majorActiveTermSupportDuration,
      majorReleaseDate.getDate(), majorReleaseDate.getHours(), majorReleaseDate.getMinutes(),
      majorReleaseDate.getSeconds(), majorReleaseDate.getMilliseconds());
}

/** Gets the long-term support NPM dist tag for a given major version. */
export function getLtsNpmDistTagOfMajor(major: number): string {
  // LTS versions should be tagged in NPM in the following format: `v{major}-lts`.
  return `v${major}-lts`;
}
