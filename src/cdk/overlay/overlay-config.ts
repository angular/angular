/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PositionStrategy} from './position/position-strategy';
import {Direction, Directionality} from '@angular/cdk/bidi';
import {ScrollStrategy, NoopScrollStrategy} from './scroll/index';


/** Initial configuration used when creating an overlay. */
export class OverlayConfig {
  /** Strategy with which to position the overlay. */
  positionStrategy?: PositionStrategy;

  /** Strategy to be used when handling scroll events while the overlay is open. */
  scrollStrategy?: ScrollStrategy = new NoopScrollStrategy();

  /** Custom class to add to the overlay pane. */
  panelClass?: string | string[] = '';

  /** Whether the overlay has a backdrop. */
  hasBackdrop?: boolean = false;

  /** Custom class to add to the backdrop */
  backdropClass?: string | string[] = 'cdk-overlay-dark-backdrop';

  /** The width of the overlay panel. If a number is provided, pixel units are assumed. */
  width?: number | string;

  /** The height of the overlay panel. If a number is provided, pixel units are assumed. */
  height?: number | string;

  /** The min-width of the overlay panel. If a number is provided, pixel units are assumed. */
  minWidth?: number | string;

  /** The min-height of the overlay panel. If a number is provided, pixel units are assumed. */
  minHeight?: number | string;

  /** The max-width of the overlay panel. If a number is provided, pixel units are assumed. */
  maxWidth?: number | string;

  /** The max-height of the overlay panel. If a number is provided, pixel units are assumed. */
  maxHeight?: number | string;

  /**
   * Direction of the text in the overlay panel. If a `Directionality` instance
   * is passed in, the overlay will handle changes to its value automatically.
   */
  direction?: Direction | Directionality;

  /**
   * Whether the overlay should be disposed of when the user goes backwards/forwards in history.
   * Note that this usually doesn't include clicking on links (unless the user is using
   * the `HashLocationStrategy`).
   */
  disposeOnNavigation?: boolean = false;

  constructor(config?: OverlayConfig) {
    if (config) {
      Object.keys(config).forEach(k => {
        const key = k as keyof OverlayConfig;

        if (typeof config[key] !== 'undefined') {
          this[key] = config[key];
        }
      });
    }
  }
}
