/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export interface Schema {
  /** Whether to skip package.json install. */
  skipPackageJson: boolean;

  /** Whether gesture support should be set up or not. */
  gestures: boolean;

  /** Name of pre-built theme to install. */
  theme: 'indigo-pink' | 'deeppurple-amber' | 'pink-bluegrey' | 'purple-green' | 'custom';

  /** Name of the project to target. */
  project?: string;
}
