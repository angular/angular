import {PositionStrategy} from './position-strategy';
import {ElementRef} from '@angular/core';

export class RelativePositionStrategy implements PositionStrategy {
  constructor(private _relativeTo: ElementRef) { }

  apply(element: Element): Promise<void> {
    // Not yet implemented.
    return null;
  }
}
