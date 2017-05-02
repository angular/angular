import {OverlayRef} from '../overlay-ref';

/**
 * Describes a strategy that will be used by an overlay
 * to handle scroll events while it is open.
 */
export interface ScrollStrategy {
  enable: () => void;
  disable: () => void;
  attach: (overlayRef: OverlayRef) => void;
}
