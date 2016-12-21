import {PositionStrategy} from './position-strategy';
import {ElementRef} from '@angular/core';

/** @docs-private */
export class RelativePositionStrategy implements PositionStrategy {
  constructor(private _relativeTo: ElementRef) { }

  apply(element: Element): Promise<void> {
    // Not yet implemented.
    return null;
  }

  dispose() {
    // Not yet implemented.
  }
}
