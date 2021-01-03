/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * DOMAnimation represents the Animation Web API.
 *
 * It is an external API by the browser, and must thus use "declare interface",
 * to prevent renaming by Closure Compiler.
 *
 * @see https://developer.mozilla.org/de/docs/Web/API/Animation
 */
export declare interface DOMAnimation {
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
