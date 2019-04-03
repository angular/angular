/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementRef, Injectable} from '@angular/core';
import {Overlay, PositionStrategy} from '@angular/cdk/overlay';

/**
 * Overridable factory responsible for configuring how cdkPopoverEdit popovers are positioned.
 */
@Injectable()
export abstract class PopoverEditPositionStrategyFactory {
  abstract forElementRef(elementRef: ElementRef): PositionStrategy;
}

/**
 * Default implementation of PopoverEditPositionStrategyFactory.
 * Uses a FlexibleConnectedPositionStrategy anchored to the start + top of the cell.
 * Note: This will change to CoverPositionStrategy once it implemented.
 */
@Injectable()
export class DefaultPopoverEditPositionStrategyFactory extends PopoverEditPositionStrategyFactory {
  constructor(protected readonly overlay: Overlay) {
    super();
  }

  forElementRef(elementRef: ElementRef): PositionStrategy {
    return this.overlay.position().flexibleConnectedTo(elementRef)
        .withGrowAfterOpen()
        .withPush()
        .withPositions([{
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'top',
        }]);
  }
}
