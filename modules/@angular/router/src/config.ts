/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '@angular/core';

/**
 * @experimental
 */
export type RouterConfig = Route[];

/**
 * @experimental
 */
export type Data = {
  [name: string]: any
};

/**
 * @experimental
 */
export type ResolveData = {
  [name: string]: any
};


/**
 * @experimental
 */
export interface Route {
  path?: string;

  /**
   * @deprecated - use `pathMatch` instead
   */
  terminal?: boolean;
  pathMatch?: 'full'|'prefix';
  component?: Type|string;
  outlet?: string;
  canActivate?: any[];
  canDeactivate?: any[];
  redirectTo?: string;
  children?: Route[];
  data?: Data;
  resolve?: ResolveData;
}

export function validateConfig(config: RouterConfig): void {
  config.forEach(validateNode);
}

function validateNode(route: Route): void {
  if (!!route.redirectTo && !!route.children) {
    throw new Error(
        `Invalid configuration of route '${route.path}': redirectTo and children cannot be used together`);
  }
  if (!!route.redirectTo && !!route.component) {
    throw new Error(
        `Invalid configuration of route '${route.path}': redirectTo and component cannot be used together`);
  }
  if (route.redirectTo === undefined && !route.component && !route.children) {
    throw new Error(
        `Invalid configuration of route '${route.path}': component, redirectTo, children must be provided`);
  }
  if (route.path === undefined) {
    throw new Error(`Invalid route configuration: routes must have path specified`);
  }
  if (route.path.startsWith('/')) {
    throw new Error(
        `Invalid route configuration of route '${route.path}': path cannot start with a slash`);
  }
  if (route.path === '' && route.redirectTo !== undefined &&
      (route.terminal === undefined && route.pathMatch === undefined)) {
    const exp =
        `The default value of 'pathMatch' is 'prefix', but often the intent is to use 'full'.`;
    throw new Error(
        `Invalid route configuration of route '{path: "${route.path}", redirectTo: "${route.redirectTo}"}': please provide 'pathMatch'. ${exp}`);
  }
}
