/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, NgZone} from '@angular/core';
import {CloseScrollStrategy} from './close-scroll-strategy';
import {NoopScrollStrategy} from './noop-scroll-strategy';
import {BlockScrollStrategy} from './block-scroll-strategy';
import {ScrollDispatcher} from '@angular/cdk/scrolling';
import {ViewportRuler} from '@angular/cdk/scrolling';
import {
  RepositionScrollStrategy,
  RepositionScrollStrategyConfig,
} from './reposition-scroll-strategy';


/**
 * Options for how an overlay will handle scrolling.
 *
 * Users can provide a custom value for `ScrollStrategyOptions` to replace the default
 * behaviors. This class primarily acts as a factory for ScrollStrategy instances.
 */
@Injectable()
export class ScrollStrategyOptions {
  constructor(
    private _scrollDispatcher: ScrollDispatcher,
    private _viewportRuler: ViewportRuler,
    private _ngZone: NgZone) { }

  /** Do nothing on scroll. */
  noop = () => new NoopScrollStrategy();

  /** Close the overlay as soon as the user scrolls. */
  close = () => new CloseScrollStrategy(this._scrollDispatcher, this._ngZone);

  /** Block scrolling. */
  block = () => new BlockScrollStrategy(this._viewportRuler);

  /**
   * Update the overlay's position on scroll.
   * @param config Configuration to be used inside the scroll strategy.
   * Allows debouncing the reposition calls.
   */
  reposition = (config?: RepositionScrollStrategyConfig) => new RepositionScrollStrategy(
      this._scrollDispatcher, this._viewportRuler, this._ngZone, config)
}
