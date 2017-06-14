/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventEmitter, TemplateRef} from '@angular/core';
import {MenuPositionX, MenuPositionY} from './menu-positions';

export interface MdMenuPanel {
  xPosition: MenuPositionX;
  yPosition: MenuPositionY;
  overlapTrigger: boolean;
  templateRef: TemplateRef<any>;
  close: EventEmitter<void>;
  focusFirstItem: () => void;
  setPositionClasses: (x: MenuPositionX, y: MenuPositionY) => void;
  _emitCloseEvent: () => void;
}
