/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directionality} from '@angular/cdk/bidi';
import {Overlay, OverlaySizeConfig, PositionStrategy} from '@angular/cdk/overlay';
import {Injectable} from '@angular/core';

/**
 * Overridable factory responsible for configuring how cdkPopoverEdit popovers are positioned
 * and sized.
 */
@Injectable()
export abstract class PopoverEditPositionStrategyFactory {
  /**
   * Creates a PositionStrategy based on the specified table cells.
   * The cells will be provided in DOM order.
   */
  abstract positionStrategyForCells(cells: HTMLElement[]): PositionStrategy;

  /**
   * Creates an OverlaySizeConfig based on the specified table cells.
   * The cells will be provided in DOM order.
   */
  abstract sizeConfigForCells(cells: HTMLElement[]): OverlaySizeConfig;
}

/**
 * Default implementation of PopoverEditPositionStrategyFactory.
 * Uses a FlexibleConnectedPositionStrategy anchored to the start + top of the cell.
 * Note: This will change to CoverPositionStrategy once it implemented.
 */
@Injectable()
export class DefaultPopoverEditPositionStrategyFactory extends PopoverEditPositionStrategyFactory {
  constructor(protected readonly direction: Directionality, protected readonly overlay: Overlay) {
    super();
  }

  positionStrategyForCells(cells: HTMLElement[]): PositionStrategy {
    return this.overlay.position()
        .flexibleConnectedTo(cells[0])
        .withGrowAfterOpen()
        .withPush()
        .withViewportMargin(16)
        .withPositions([{
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'top',
        }]);
  }

  sizeConfigForCells(cells: HTMLElement[]): OverlaySizeConfig {
    if (cells.length === 0) {
      return {};
    }

    if (cells.length === 1) {
      return {width: cells[0].getBoundingClientRect().width};
    }

    let firstCell, lastCell;
    if (this.direction.value === 'ltr') {
      firstCell = cells[0];
      lastCell = cells[cells.length - 1];
    } else {
      lastCell = cells[0];
      firstCell = cells[cells.length - 1];
    }

    return {width: lastCell.getBoundingClientRect().right - firstCell.getBoundingClientRect().left};
  }
}
