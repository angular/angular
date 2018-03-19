/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ScrollDispatcher, ViewportRuler} from '@angular/cdk/scrolling';
import {DOCUMENT} from '@angular/common';
import {Inject, Injectable, NgZone} from '@angular/core';
import {BlockScrollStrategy} from './block-scroll-strategy';
import {CloseScrollStrategy, CloseScrollStrategyConfig} from './close-scroll-strategy';
import {NoopScrollStrategy} from './noop-scroll-strategy';
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
@Injectable({providedIn: 'root'})
export class ScrollStrategyOptions {
  private _document: Document;

  constructor(
    private _scrollDispatcher: ScrollDispatcher,
    private _viewportRuler: ViewportRuler,
    private _ngZone: NgZone,
    @Inject(DOCUMENT) document: any) {
      this._document = document;
    }

  /** Do nothing on scroll. */
  noop = () => new NoopScrollStrategy();

  /**
   * Close the overlay as soon as the user scrolls.
   * @param config Configuration to be used inside the scroll strategy.
   */
  close = (config?: CloseScrollStrategyConfig) => new CloseScrollStrategy(this._scrollDispatcher,
      this._ngZone, this._viewportRuler, config)

  /** Block scrolling. */
  block = () => new BlockScrollStrategy(this._viewportRuler, this._document);

  /**
   * Update the overlay's position on scroll.
   * @param config Configuration to be used inside the scroll strategy.
   * Allows debouncing the reposition calls.
   */
  reposition = (config?: RepositionScrollStrategyConfig) => new RepositionScrollStrategy(
      this._scrollDispatcher, this._viewportRuler, this._ngZone, config)
}
