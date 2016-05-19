import {ViewportRuler} from './viewport-ruler';
import {ConnectedPositionStrategy} from './connected-position-strategy';
import {ElementRef, Injectable} from '@angular/core';
import {GlobalPositionStrategy} from './global-position-strategy';
import {OverlayPos, OriginPos} from './connected-position';



/** Builder for overlay position strategy. */
@Injectable()
export class OverlayPositionBuilder {
  constructor(private _viewportRuler: ViewportRuler) { }

  /** Creates a global position strategy. */
  global() {
    return new GlobalPositionStrategy();
  }

  /** Creates a relative position strategy. */
  connectedTo(elementRef: ElementRef, originPos: OriginPos, overlayPos: OverlayPos) {
    return new ConnectedPositionStrategy(elementRef, originPos, overlayPos, this._viewportRuler);
  }
}

