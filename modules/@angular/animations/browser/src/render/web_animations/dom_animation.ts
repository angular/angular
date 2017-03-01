/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export interface DOMAnimation {
  cancel(): void;
  play(): void;
  pause(): void;
  finish(): void;
  onfinish: Function;
  position: number;
  currentTime: number;
  addEventListener(eventName: string, handler: (event: any) => any): any;
  dispatchEvent(eventName: string): any;
}
