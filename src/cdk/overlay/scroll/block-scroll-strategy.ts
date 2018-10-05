/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ScrollStrategy} from './scroll-strategy';
import {ViewportRuler} from '@angular/cdk/scrolling';
import {coerceCssPixelValue} from '@angular/cdk/coercion';

/**
 * Extended `CSSStyleDeclaration` that includes `scrollBehavior` which isn't part of the
 * built-in TS typings. Once it is, this declaration can be removed safely.
 * @docs-private
 */
type ScrollBehaviorCSSStyleDeclaration = CSSStyleDeclaration & {scrollBehavior: string};

/**
 * Strategy that will prevent the user from scrolling while the overlay is visible.
 */
export class BlockScrollStrategy implements ScrollStrategy {
  private _previousHTMLStyles = {top: '', left: ''};
  private _previousScrollPosition: { top: number, left: number };
  private _isEnabled = false;
  private _document: Document;

  constructor(private _viewportRuler: ViewportRuler, document: any) {
    this._document = document;
  }

  /** Attaches this scroll strategy to an overlay. */
  attach() { }

  /** Blocks page-level scroll while the attached overlay is open. */
  enable() {
    if (this._canBeEnabled()) {
      const root = this._document.documentElement!;

      this._previousScrollPosition = this._viewportRuler.getViewportScrollPosition();

      // Cache the previous inline styles in case the user had set them.
      this._previousHTMLStyles.left = root.style.left || '';
      this._previousHTMLStyles.top = root.style.top || '';

      // Note: we're using the `html` node, instead of the `body`, because the `body` may
      // have the user agent margin, whereas the `html` is guaranteed not to have one.
      root.style.left = coerceCssPixelValue(-this._previousScrollPosition.left);
      root.style.top = coerceCssPixelValue(-this._previousScrollPosition.top);
      root.classList.add('cdk-global-scrollblock');
      this._isEnabled = true;
    }
  }

  /** Unblocks page-level scroll while the attached overlay is open. */
  disable() {
    if (this._isEnabled) {
      const html = this._document.documentElement!;
      const body = this._document.body!;
      const htmlStyle = html.style as ScrollBehaviorCSSStyleDeclaration;
      const bodyStyle = body.style as ScrollBehaviorCSSStyleDeclaration;
      const previousHtmlScrollBehavior = htmlStyle.scrollBehavior || '';
      const previousBodyScrollBehavior = bodyStyle.scrollBehavior || '';

      this._isEnabled = false;

      htmlStyle.left = this._previousHTMLStyles.left;
      htmlStyle.top = this._previousHTMLStyles.top;
      html.classList.remove('cdk-global-scrollblock');

      // Disable user-defined smooth scrolling temporarily while we restore the scroll position.
      // See https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-behavior
      htmlStyle.scrollBehavior = bodyStyle.scrollBehavior = 'auto';

      window.scroll(this._previousScrollPosition.left, this._previousScrollPosition.top);

      htmlStyle.scrollBehavior = previousHtmlScrollBehavior;
      bodyStyle.scrollBehavior = previousBodyScrollBehavior;
    }
  }

  private _canBeEnabled(): boolean {
    // Since the scroll strategies can't be singletons, we have to use a global CSS class
    // (`cdk-global-scrollblock`) to make sure that we don't try to disable global
    // scrolling multiple times.
    const html = this._document.documentElement!;

    if (html.classList.contains('cdk-global-scrollblock') || this._isEnabled) {
      return false;
    }

    const body = this._document.body;
    const viewport = this._viewportRuler.getViewportSize();
    return body.scrollHeight > viewport.height || body.scrollWidth > viewport.width;
  }
}
