import {Subscription} from 'rxjs/Subscription';
import {ScrollStrategy} from './scroll-strategy';
import {OverlayRef} from '../overlay-ref';
import {ScrollDispatcher} from './scroll-dispatcher';


/**
 * Strategy that will update the element position as the user is scrolling.
 */
export class RepositionScrollStrategy implements ScrollStrategy {
  private _scrollSubscription: Subscription|null = null;
  private _overlayRef: OverlayRef;

  constructor(private _scrollDispatcher: ScrollDispatcher, private _scrollThrottle = 0) { }

  attach(overlayRef: OverlayRef) {
    this._overlayRef = overlayRef;
  }

  enable() {
    if (!this._scrollSubscription) {
      this._scrollSubscription = this._scrollDispatcher.scrolled(this._scrollThrottle, () => {
        this._overlayRef.updatePosition();
      });
    }
  }

  disable() {
    if (this._scrollSubscription) {
      this._scrollSubscription.unsubscribe();
      this._scrollSubscription = null;
    }
  }
}
