/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ScrollStrategy} from './scroll-strategy';
import {ViewportRuler} from '@angular/cdk/scrolling';

/**
 * Strategy that will prevent the user from scrolling while the overlay is visible.
 */
export class BlockScrollStrategy implements ScrollStrategy {
  private _previousHTMLStyles = { top: '', left: '' };
  private _previousScrollPosition: { top: number, left: number };
  private _isEnabled = false;

  constructor(private _viewportRuler: ViewportRuler) { }

  /** Attaches this scroll strategy to an overlay. */
  attach() { }

  /** Blocks page-level scroll while the attached overlay is open. */
  enable() {
    if (this._canBeEnabled()) {
      const root = document.documentElement;

      this._previousScrollPosition = this._viewportRuler.getViewportScrollPosition();

      // Cache the previous inline styles in case the user had set them.
      this._previousHTMLStyles.left = root.style.left || '';
      this._previousHTMLStyles.top = root.style.top || '';

      // Note: we're using the `html` node, instead of the `body`, because the `body` may
      // have the user agent margin, whereas the `html` is guaranteed not to have one.
      root.style.left = `${-this._previousScrollPosition.left}px`;
      root.style.top = `${-this._previousScrollPosition.top}px`;
      root.classList.add('cdk-global-scrollblock');
      this._isEnabled = true;
    }
  }

  /** Unblocks page-level scroll while the attached overlay is open. */
  disable() {
    if (this._isEnabled) {
      const html = document.documentElement;
      const body = document.body;
      const previousHtmlScrollBehavior = html.style['scrollBehavior'] || '';
      const previousBodyScrollBehavior = body.style['scrollBehavior'] || '';

      this._isEnabled = false;

      html.style.left = this._previousHTMLStyles.left;
      html.style.top = this._previousHTMLStyles.top;
      html.classList.remove('cdk-global-scrollblock');

      // Disable user-defined smooth scrolling temporarily while we restore the scroll position.
      // See https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-behavior
      html.style['scrollBehavior'] = body.style['scrollBehavior'] = 'auto';

      window.scroll(this._previousScrollPosition.left, this._previousScrollPosition.top);

      html.style['scrollBehavior'] = previousHtmlScrollBehavior;
      body.style['scrollBehavior'] = previousBodyScrollBehavior;
    }
  }

  private _canBeEnabled(): boolean {
    // Since the scroll strategies can't be singletons, we have to use a global CSS class
    // (`cdk-global-scrollblock`) to make sure that we don't try to disable global
    // scrolling multiple times.
    if (document.documentElement.classList.contains('cdk-global-scrollblock') || this._isEnabled) {
      return false;
    }

    const body = document.body;
    const viewport = this._viewportRuler.getViewportSize();
    return body.scrollHeight > viewport.height || body.scrollWidth > viewport.width;
  }
}
