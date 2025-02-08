/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Helper type for creating unique branded IDs.
 *
 * Unique IDs are a fundamental piece for a `Tsurge` migration because
 * they allow for serializable analysis data between the stages.
 *
 * This is important to e.g. uniquely identify an Angular input across
 * compilation units, so that shared global data can be built via
 * the `merge` phase.
 *
 * E.g. a unique ID for an input may be the project-relative file path,
 * in combination with the name of its owning class, plus the field name.
 */
export type UniqueID<Name> = string & {__branded: Name};
