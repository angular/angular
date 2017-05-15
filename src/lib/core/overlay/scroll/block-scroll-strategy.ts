import {ScrollStrategy} from './scroll-strategy';
import {ViewportRuler} from '../position/viewport-ruler';

/**
 * Strategy that will prevent the user from scrolling while the overlay is visible.
 */
export class BlockScrollStrategy implements ScrollStrategy {
  private _previousHTMLStyles = { top: null, left: null };
  private _previousScrollPosition: { top: number, left: number };
  private _isEnabled = false;

  constructor(private _viewportRuler: ViewportRuler) { }

  attach() { }

  enable() {
    if (this._canBeEnabled()) {
      const root = document.documentElement;

      this._previousScrollPosition = this._viewportRuler.getViewportScrollPosition();

      // Cache the previous inline styles in case the user had set them.
      this._previousHTMLStyles.left = root.style.left;
      this._previousHTMLStyles.top = root.style.top;

      // Note: we're using the `html` node, instead of the `body`, because the `body` may
      // have the user agent margin, whereas the `html` is guaranteed not to have one.
      root.style.left = `${-this._previousScrollPosition.left}px`;
      root.style.top = `${-this._previousScrollPosition.top}px`;
      root.classList.add('cdk-global-scrollblock');
      this._isEnabled = true;
    }
  }

  disable() {
    if (this._isEnabled) {
      this._isEnabled = false;
      document.documentElement.style.left = this._previousHTMLStyles.left;
      document.documentElement.style.top = this._previousHTMLStyles.top;
      document.documentElement.classList.remove('cdk-global-scrollblock');
      window.scroll(this._previousScrollPosition.left, this._previousScrollPosition.top);
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
    const viewport = this._viewportRuler.getViewportRect();
    return body.scrollHeight > viewport.height || body.scrollWidth > viewport.width;
  }
}
