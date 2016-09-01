/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export interface DomAnimatePlayer {
  cancel(): void;
  play(): void;
  pause(): void;
  finish(): void;
  onfinish: Function;
  position: number;
  currentTime: number;
}
