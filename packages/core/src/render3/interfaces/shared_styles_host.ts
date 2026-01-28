/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '../../di/injection_token';

/** Token used to retrieve the `SharedStylesHost`. */
export const SHARED_STYLES_HOST = new InjectionToken<SharedStylesHost>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'SHARED_STYLES_HOST' : '',
);

/** Manages stylesheets for components in the application. */
export interface SharedStylesHost {
  /**
   * Adds embedded styles to the DOM via HTML `style` elements.
   * @param styles An array of style content strings.
   * @param urls An array of URLs to be added as link tags.
   */
  addStyles(styles: string[], urls?: string[]): void;

  /**
   * Removes embedded styles from the DOM that were added as HTML `style` elements.
   * @param styles An array of style content strings.
   * @param urls An array of URLs to be removed as link tags.
   */
  removeStyles(styles: string[], urls?: string[]): void;

  /**
   * Adds a host node to contain styles added to the DOM and adds all existing style usage to
   * the newly added host node.
   *
   * @param hostNode The node to contain styles added to the DOM.
   */
  addHost(hostNode: Node): void;

  /**
   * Removes a host node from the set of style hosts and removes all existing style usage from
   * the removed host node.
   *
   * @param hostNode The node to remove from the set of style hosts.
   */
  removeHost(hostNode: Node): void;
}
