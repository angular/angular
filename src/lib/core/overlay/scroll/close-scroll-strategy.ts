import {ScrollStrategy, getMdScrollStrategyAlreadyAttachedError} from './scroll-strategy';
import {OverlayRef} from '../overlay-ref';
import {Subscription} from 'rxjs/Subscription';
import {ScrollDispatcher} from './scroll-dispatcher';


/**
 * Strategy that will close the overlay as soon as the user starts scrolling.
 */
export class CloseScrollStrategy implements ScrollStrategy {
  private _scrollSubscription: Subscription|null = null;
  private _overlayRef: OverlayRef;

  constructor(private _scrollDispatcher: ScrollDispatcher) { }

  attach(overlayRef: OverlayRef) {
    if (this._overlayRef) {
      throw getMdScrollStrategyAlreadyAttachedError();
    }

    this._overlayRef = overlayRef;
  }

  enable() {
    if (!this._scrollSubscription) {
      this._scrollSubscription = this._scrollDispatcher.scrolled(null, () => {
        if (this._overlayRef.hasAttached()) {
          this._overlayRef.detach();
        }

        this.disable();
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
