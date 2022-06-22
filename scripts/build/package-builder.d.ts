/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Build the Angular packages.
 *
 * @param {string} destDir Path to the output directory into which we copy the npm packages.
 * This path should either be absolute or relative to the project root.
 * @param {string} description Human-readable description of the build.
 * @param {boolean?} isRelease True, if the build should be stamped for a release.
 * @returns {Array<{name: string, outputPath: string}} A list of packages built.
 */
export declare function buildTargetPackages(destDir, description, isRelease: boolean): {name: string, outputPath: string}[];
