/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, NgZone} from '@angular/core';
import {CdkTable} from '@angular/cdk/table';

import {ColumnResize} from '../column-resize';
import {ColumnResizeNotifier, ColumnResizeNotifierSource} from '../column-resize-notifier';
import {HeaderRowEventDispatcher} from '../event-dispatcher';
import {FLEX_PROVIDERS} from './constants';

/**
 * Implicitly enables column resizing for a flex cdk-table.
 * Individual columns will be resizable unless opted out.
 */
@Directive({
  selector: 'cdk-table',
  providers: [
    ...FLEX_PROVIDERS,
    {provide: ColumnResize, useExisting: CdkDefaultEnabledColumnResizeFlex},
  ],
})
export class CdkDefaultEnabledColumnResizeFlex extends ColumnResize {
  constructor(
    readonly columnResizeNotifier: ColumnResizeNotifier,
    readonly elementRef: ElementRef<HTMLElement>,
    protected readonly eventDispatcher: HeaderRowEventDispatcher,
    protected readonly ngZone: NgZone,
    protected readonly notifier: ColumnResizeNotifierSource,
    protected readonly table: CdkTable<unknown>,
  ) {
    super();
  }
}
