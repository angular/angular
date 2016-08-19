/** Strategy for setting the position on an overlay. */
export interface PositionStrategy {

  /** Updates the position of the overlay element. */
  apply(element: Element): Promise<void>;
}
