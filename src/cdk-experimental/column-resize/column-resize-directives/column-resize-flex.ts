/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, NgZone} from '@angular/core';
import {Directionality} from '@angular/cdk/bidi';

import {ColumnResize} from '../column-resize';
import {ColumnResizeNotifier, ColumnResizeNotifierSource} from '../column-resize-notifier';
import {HeaderRowEventDispatcher} from '../event-dispatcher';
import {HOST_BINDINGS, FLEX_PROVIDERS} from './constants';

/**
 * Explicitly enables column resizing for a flexbox-based cdk-table.
 * Individual columns must be annotated specifically.
 */
@Directive({
  selector: 'cdk-table[columnResize]',
  host: HOST_BINDINGS,
  providers: [
    ...FLEX_PROVIDERS,
    {provide: ColumnResize, useExisting: CdkColumnResizeFlex},
  ],
})
export class CdkColumnResizeFlex extends ColumnResize {
  constructor(
      readonly columnResizeNotifier: ColumnResizeNotifier,
      readonly directionality: Directionality,
      protected readonly elementRef: ElementRef,
      protected readonly eventDispatcher: HeaderRowEventDispatcher,
      protected readonly ngZone: NgZone,
      protected readonly notifier: ColumnResizeNotifierSource) {
    super();
  }
}
