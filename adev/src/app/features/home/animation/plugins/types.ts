/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Animation} from '../animation';

/**
 * Animation plugin interface.
 * Plugins can be added to an animation via `Animation.addPlugin()`.
 */
export interface AnimationPlugin {
  /** Contains the plugin initialization login. */
  init(animation: Animation): void;

  /** Will be called on Animation disposal. */
  destroy(): void;
}
