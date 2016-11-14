/** Horizontal dimension of a connection point on the perimeter of the origin or overlay element. */
export type HorizontalConnectionPos = 'start' | 'center' | 'end';

/** Vertical dimension of a connection point on the perimeter of the origin or overlay element. */
export type VerticalConnectionPos = 'top' | 'center' | 'bottom';


/** A connection point on the origin element. */
export interface OriginConnectionPosition {
  originX: HorizontalConnectionPos;
  originY: VerticalConnectionPos;
}

/** A connection point on the overlay element. */
export interface OverlayConnectionPosition {
  overlayX: HorizontalConnectionPos;
  overlayY: VerticalConnectionPos;
}

/** The points of the origin element and the overlay element to connect. */
export class ConnectionPositionPair {
  originX: HorizontalConnectionPos;
  originY: VerticalConnectionPos;
  overlayX: HorizontalConnectionPos;
  overlayY: VerticalConnectionPos;

  constructor(origin: OriginConnectionPosition, overlay: OverlayConnectionPosition) {
    this.originX = origin.originX;
    this.originY = origin.originY;
    this.overlayX = overlay.overlayX;
    this.overlayY = overlay.overlayY;
  }
}

/** The change event emitted by the strategy when a fallback position is used. */
export class ConnectedOverlayPositionChange {
  constructor(public connectionPair: ConnectionPositionPair) {}
}
