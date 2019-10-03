/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Stripped-down HammerJS annotations to be used within Material, which are necessary,
 * because HammerJS is an optional dependency. For the full annotations see:
 * https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/hammerjs/index.d.ts
 */

/**
 * @deprecated No longer being used. To be removed.
 * @breaking-change 10.0.0
 * @docs-private
 */
export interface HammerInput {
  preventDefault: () => {};
  deltaX: number;
  deltaY: number;
  center: { x: number; y: number; };
}

/**
 * @deprecated No longer being used. To be removed.
 * @breaking-change 10.0.0
 * @docs-private
 */
export interface HammerStatic {
  new(element: HTMLElement | SVGElement, options?: any): HammerManager;

  Pan: Recognizer;
  Swipe: Recognizer;
  Press: Recognizer;
}

/**
 * @deprecated No longer being used. To be removed.
 * @breaking-change 10.0.0
 * @docs-private
 */
export interface Recognizer {
  new(options?: any): Recognizer;
  recognizeWith(otherRecognizer: Recognizer | string): Recognizer;
}

/**
 * @deprecated No longer being used. To be removed.
 * @breaking-change 10.0.0
 * @docs-private
 */
export interface RecognizerStatic {
  new(options?: any): Recognizer;
}

/**
 * @deprecated No longer being used. To be removed.
 * @breaking-change 10.0.0
 * @docs-private
 */
export interface HammerInstance {
  on(eventName: string, callback: Function): void;
  off(eventName: string, callback: Function): void;
}

/**
 * @deprecated No longer being used. To be removed.
 * @breaking-change 10.0.0
 * @docs-private
 */
export interface HammerManager {
  add(recogniser: Recognizer | Recognizer[]): Recognizer;
  set(options: any): HammerManager;
  emit(event: string, data: any): void;
  off(events: string, handler?: Function): void;
  on(events: string, handler: Function): void;
}

/**
 * @deprecated No longer being used. To be removed.
 * @breaking-change 10.0.0
 * @docs-private
 */
export interface HammerOptions {
  cssProps?: {[key: string]: string};
  domEvents?: boolean;
  enable?: boolean | ((manager: HammerManager) => boolean);
  preset?: any[];
  touchAction?: string;
  recognizers?: any[];

  inputClass?: HammerInput;
  inputTarget?: EventTarget;
}
