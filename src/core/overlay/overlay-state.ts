import {PositionStrategy} from './position/position-strategy';


/**
 * OverlayState is a bag of values for either the initial configuration or current state of an
 * overlay.
 */
export class OverlayState {
  /** Strategy with which to position the overlay. */
  positionStrategy: PositionStrategy;

  // TODO(jelbourn): configuration still to add
  // - overlay size
  // - focus trap
  // - disable pointer events
  // - z-index
}
