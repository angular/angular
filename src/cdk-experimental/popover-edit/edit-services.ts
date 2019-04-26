/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, NgZone} from '@angular/core';
import {FocusTrapFactory} from '@angular/cdk/a11y';
import {Directionality} from '@angular/cdk/bidi';
import {Overlay} from '@angular/cdk/overlay';
import {ScrollDispatcher, ViewportRuler} from '@angular/cdk/scrolling';

import {EditEventDispatcher} from './edit-event-dispatcher';
import {FocusDispatcher} from './focus-dispatcher';
import {PopoverEditPositionStrategyFactory} from './popover-edit-position-strategy-factory';

/**
 * Optimization
 * Collects multiple Injectables into a singleton shared across the table. By reducing the
 * number of services injected into each CdkPopoverEdit, this saves about 0.023ms of cpu time
 * and 56 bytes of memory per instance.
 */
@Injectable()
export class EditServices {
  constructor(
      readonly directionality: Directionality,
      readonly editEventDispatcher: EditEventDispatcher, readonly focusDispatcher: FocusDispatcher,
      readonly focusTrapFactory: FocusTrapFactory, readonly ngZone: NgZone,
      readonly overlay: Overlay, readonly positionFactory: PopoverEditPositionStrategyFactory,
      readonly scrollDispatcher: ScrollDispatcher, readonly viewportRuler: ViewportRuler) {}
}
