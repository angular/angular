/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventEmitter, TemplateRef} from '@angular/core';
import {MenuPositionX, MenuPositionY} from './menu-positions';
import {Direction} from '@angular/cdk/bidi';

/**
 * Interface for a custom menu panel that can be used with `matMenuTriggerFor`.
 * @docs-private
 */
export interface MatMenuPanel {
  xPosition: MenuPositionX;
  yPosition: MenuPositionY;
  overlapTrigger: boolean;
  templateRef: TemplateRef<any>;
  close: EventEmitter<void | 'click' | 'keydown'>;
  parentMenu?: MatMenuPanel | undefined;
  direction?: Direction;
  focusFirstItem: () => void;
  resetActiveItem: () => void;
  setPositionClasses: (x: MenuPositionX, y: MenuPositionY) => void;
  setElevation?(depth: number): void;
}
