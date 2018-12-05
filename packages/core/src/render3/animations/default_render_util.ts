/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {RenderUtil} from './interfaces';
import {applyReflow, applyTransition, computeStyle} from './util';

let DEFAULT_RENDER_UTIL: RenderUtil;
export function getDefaultRenderUtil() {
  return DEFAULT_RENDER_UTIL || (DEFAULT_RENDER_UTIL = new DefaultRenderUtil());
}

export class DefaultRenderUtil implements RenderUtil {
  getComputedStyle(element: HTMLElement, prop: string): string {
    return computeStyle(element, prop);
  }
  fireReflow(element: HTMLElement, frameCallback?: () => any): void {
    applyReflow(element, frameCallback);
  }
  setTimeout(fn: Function, time: number): any { return setTimeout(fn, time); }
  clearTimeout(timeoutVal: any): void { clearTimeout(timeoutVal); }
  setTransition(element: HTMLElement, value: string|null): void { applyTransition(element, value); }
}