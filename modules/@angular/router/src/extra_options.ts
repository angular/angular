/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ErrorHandler} from './router';

/**
 * @whatItDoes Represents options to configure RouterLinkActive.
 *
 * @experimental
 */
export interface RouterLinkActiveOptions {
  /**
   *
   */
  enabled?: boolean;

  /**
   * Configures the default class.
   */
  defaultClass?: string;

  /**
   *
   */
  exact?: boolean;
}


/**
 * @whatItDoes Represents options to configure the router.
 *
 * @stable
 */
export interface ExtraOptions {
  /**
   * Makes the router log all its internal events to the console.
   */
  enableTracing?: boolean;

  /**
   * Enables the location strategy that uses the URL fragment instead of the history API.
   */
  useHash?: boolean;

  /**
   * Disables the initial navigation.
   */
  initialNavigation?: boolean;

  /**
   * A custom error handler.
   */
  errorHandler?: ErrorHandler;

  /**
   * Configures a preloading strategy. See {@link PreloadAllModules}.
   */
  preloadingStrategy?: any;

  /**
   *
   */
  routerLinkActive?: RouterLinkActiveOptions;
}
