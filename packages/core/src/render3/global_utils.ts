/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {global} from '../util';
import {getComponent, getDirectives, getHostComponent, getInjector, getPlayers, getRootComponents} from './global_utils_api';

/**
 * This file introduces series of globally accessible debug tools
 * to allow for the Angular debugging story to function.
 *
 * To see this in action run the following command:
 *
 *   bazel run --define=compile=aot
 *   //packages/core/test/bundling/todo:devserver
 *
 *  Then load `localhost:5432` and start using the console tools.
 */

/**
 * This value reflects the property on the window where the dev
 * tools are patched (window.ng).
 * */
export const GLOBAL_PUBLISH_EXPANDO_KEY = 'ng';

/*
 * Publishes a collection of default debug tools onto `window._ng_`.
 *
 * These functions are available globally when Angular is in development
 * mode and are automatically stripped away from prod mode is on.
 */
let _published = false;
export function publishDefaultGlobalUtils() {
  if (!_published) {
    _published = true;
    publishGlobalUtil('getComponent', getComponent);
    publishGlobalUtil('getHostComponent', getHostComponent);
    publishGlobalUtil('getInjector', getInjector);
    publishGlobalUtil('getRootComponents', getRootComponents);
    publishGlobalUtil('getDirectives', getDirectives);
    publishGlobalUtil('getPlayers', getPlayers);
  }
}

export declare type GlobalDevModeContainer = {
  [GLOBAL_PUBLISH_EXPANDO_KEY]: {[fnName: string]: Function};
};

/**
 * Publishes the given function to `window.ngDevMode` so that it can be
 * used from the browser console when an application is not in production.
 */
export function publishGlobalUtil(name: string, fn: Function): void {
  const w = global as any as GlobalDevModeContainer;
  if (w) {
    let container = w[GLOBAL_PUBLISH_EXPANDO_KEY];
    if (!container) {
      container = w[GLOBAL_PUBLISH_EXPANDO_KEY] = {};
    }
    container[name] = fn;
  }
}
